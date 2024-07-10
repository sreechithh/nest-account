import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, Repository, In } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { ExpenseStatus } from './enums/expense-status.enum';
import { CreateExpenseInput } from './dto/create-expense.input';
import { UpdateExpenseInput } from './dto/update-expense.input';
import { ExpenseCategory } from '../expense-category/entities/expense-category.entity';
import { ExpenseSubCategory } from '../expense-sub-category/entities/expense-sub-category.entity';
import { EmployeeExpense } from '../employee-expense/entities/employee-expense.entity';
import { User } from '../users/entities/user.entity';
import { BankTransaction } from '../bank-transactions/entities/bank-transaction.entity';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(ExpenseCategory)
    private readonly expenseCategoryRepository: Repository<ExpenseCategory>,
    @InjectRepository(ExpenseSubCategory)
    private readonly expenseSubCategoryRepository: Repository<ExpenseSubCategory>,
    @InjectRepository(EmployeeExpense)
    private readonly employeeExpenseRepository: Repository<EmployeeExpense>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BankTransaction)
    private readonly bankTransactionRepository: Repository<BankTransaction>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async create(
    createExpenseInput: CreateExpenseInput,
    createdBy: number,
  ): Promise<Expense> {
    return await this.dataSource.transaction(async (manager) => {
      const {
        expenseCategoryId,
        expenseSubCategoryId,
        isPaymentRequest,
        paidDate,
        employeeId,
        bankId,
        ...expenseData
      } = createExpenseInput;

      const expenseCategory = await manager.findOne(ExpenseCategory, {
        where: { id: expenseCategoryId },
      });
      if (!expenseCategory) {
        throw new NotFoundException(
          `ExpenseCategory with ID ${expenseCategoryId} not found`,
        );
      }

      const expenseSubCategory = await manager.findOneOrFail(
        ExpenseSubCategory,
        {
          where: { id: expenseSubCategoryId },
        },
      );

      const finalStatus = isPaymentRequest
        ? ExpenseStatus.PENDING
        : ExpenseStatus.PAID;

      const paidAt = finalStatus === ExpenseStatus.PAID ? new Date() : null;

      let bankTransactionId: number | null = null;

      if (!isPaymentRequest) {
        if (!bankId) {
          throw new Error(
            'bankId is required when it is not a Payment Request.',
          );
        }

        const bankTransaction = this.bankTransactionRepository.create({
          bankId,
          amount: expenseData.amount,
          comment: expenseData.comments || 'Expense payment',
          type: 'debit',
          createdBy,
        });

        const savedBankTransaction = await manager.save(
          BankTransaction,
          bankTransaction,
        );
        bankTransactionId = savedBankTransaction.id;
      }

      const expense = manager.create(Expense, {
        ...expenseData,
        status: finalStatus,
        expenseCategory,
        expenseSubCategory,
        isPaymentRequest,
        createdBy,
        updatedBy: createdBy,
        paidAt,
        paidDate,
        bankTransactionId: bankTransactionId || undefined,
      });

      let savedExpense = await manager.save(Expense, expense);

      if (expenseCategory.name === 'Staff' && employeeId) {
        const employee = await manager.findOneOrFail(User, {
          where: { id: employeeId },
          relations: ['roles'],
        });

        if (
          employee &&
          employee.roles.some((role) => role.name === 'employee')
        ) {
          const employeeExpense = manager.create(EmployeeExpense, {
            expense: savedExpense,
            user: employee,
          });
          await manager.save(EmployeeExpense, employeeExpense);

          const newExpense = await manager.findOne(Expense, {
            where: { id: savedExpense.id },
            relations: [
              'expenseCategory',
              'expenseSubCategory',
              'bankTransaction',
              'company',
              'employeeExpense',
              'employeeExpense.user',
            ],
          });
          if (newExpense) {
            savedExpense = newExpense;
          }
        }
      }

      return savedExpense;
    });
  }

  async findAll(
    pageSize: number = 10,
    pageNumber: number = 1,
  ): Promise<Expense[]> {
    const options: FindManyOptions<Expense> = {
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
      relations: [
        'expenseCategory',
        'expenseSubCategory',
        'employeeExpense',
        'employeeExpense.user',
        'bankTransaction',
        'company',
      ],
      order: { id: 'DESC' },
    };
    const expenses = await this.expenseRepository.find(options);

    return expenses;
  }

  async findOne(id: number): Promise<Expense> {
    return await this.expenseRepository.findOneOrFail({
      where: { id },
      relations: [
        'expenseCategory',
        'expenseSubCategory',
        'employeeExpense',
        'employeeExpense.user',
        'bankTransaction',
        'company',
      ],
    });
  }

  async update(
    id: number,
    updateExpenseInput: UpdateExpenseInput,
    updatedBy: number,
  ): Promise<Expense> {
    return await this.dataSource.transaction(async (manager) => {
      const {
        expenseCategoryId,
        expenseSubCategoryId,
        paidDate,
        employeeId,
        ...expenseData
      } = updateExpenseInput;

      const expense = await manager.findOne(Expense, {
        where: { id },
      });

      if (!expense) {
        throw new NotFoundException(`Expense with ID ${id} Not Found`);
      }

      if (
        expense.status == ExpenseStatus.APPROVED ||
        expense.status == ExpenseStatus.REJECTED ||
        expense.adminResponse
      ) {
        throw new Error(
          `Expense Approved or Rejected bv the admin cannot be updated`,
        );
      }

      const originalCategoryId = expense.expenseCategoryId;
      const isCategoryChanged = originalCategoryId !== expenseCategoryId;
      console.log(expenseCategoryId);

      const expenseCategory = await manager.findOne(ExpenseCategory, {
        where: { id: expenseCategoryId },
      });
      if (!expenseCategory) {
        throw new NotFoundException(
          `ExpenseCategory with ID ${expenseCategoryId} Not Found`,
        );
      }
      const expenseSubCategory = await manager.findOne(ExpenseSubCategory, {
        where: { id: expenseSubCategoryId },
      });
      if (!expenseSubCategory) {
        throw new NotFoundException(
          `ExpenseSubCategory with ID ${expenseSubCategoryId} Not Found`,
        );
      }

      const paidAt = expense.status === ExpenseStatus.PAID ? new Date() : null;

      Object.assign(expense, {
        ...expenseData,
        expenseCategory,
        expenseSubCategory,
        paidDate,
        updatedBy,
        updatedAt: new Date(),
        paidAt,
      });

      const updatedExpense = await manager.save(Expense, expense);

      if (isCategoryChanged && expense.employeeExpense) {
        await manager.remove(EmployeeExpense, expense.employeeExpense);
      }

      if (expenseCategory.name === 'Staff' && employeeId) {
        const employee = await manager.findOne(User, {
          where: { id: employeeId },
          relations: ['roles'],
        });

        if (
          employee &&
          employee.roles.some((role) => role.name === 'employee')
        ) {
          let employeeExpense = await manager.findOne(EmployeeExpense, {
            where: { expense: updatedExpense },
          });

          if (!employeeExpense) {
            employeeExpense = manager.create(EmployeeExpense, {
              expense: updatedExpense,
              user: employee,
            });
          } else {
            employeeExpense.user = employee;
          }

          await manager.save(EmployeeExpense, employeeExpense);
        }
      }

      const updatedExpenseWithRelations = await manager.findOne(Expense, {
        where: { id: updatedExpense.id },
        relations: [
          'expenseCategory',
          'expenseSubCategory',
          'employeeExpense',
          'employeeExpense.user',
          'bankTransaction',
          'company',
        ],
      });

      if (!updatedExpenseWithRelations) {
        throw new Error(`Failed to retrieve updated expense with ID ${id}.`);
      }

      return updatedExpenseWithRelations;
    });
  }

  async remove(id: number): Promise<Expense> {
    return await this.dataSource.transaction(async (manager) => {
      const expense = await this.findOne(id);

      if (expense.employeeExpense) {
        await manager.remove(EmployeeExpense, expense.employeeExpense);
      }

      if (expense.bankTransactionId) {
        const bankTransaction = await this.bankTransactionRepository.findOne({
          where: { id: expense.bankTransactionId },
        });
        if (bankTransaction) {
          await manager.remove(BankTransaction, bankTransaction);
        }
      }

      await manager.remove(Expense, expense);
      return { ...expense, id };
    });
  }

  async approveExpenses(ids: number[]): Promise<boolean> {
    return await this.dataSource.transaction(async (manager) => {
      const expenses = await manager.find(Expense, {
        where: { id: In(ids), status: ExpenseStatus.PENDING },
      });

      if (expenses.length !== ids.length) {
        throw new NotFoundException(
          'Some expenses were not found or are not pending',
        );
      }

      for (const expense of expenses) {
        expense.status = ExpenseStatus.APPROVED;
        expense.adminResponse = new Date();
      }

      await manager.save(Expense, expenses);
      return true;
    });
  }

  async rejectExpenses(ids: number[]): Promise<boolean> {
    return await this.dataSource.transaction(async (manager) => {
      const expenses = await manager.find(Expense, {
        where: { id: In(ids), status: ExpenseStatus.PENDING },
      });

      if (expenses.length !== ids.length) {
        throw new NotFoundException(
          'Some expenses were not found or are not pending',
        );
      }

      for (const expense of expenses) {
        expense.status = ExpenseStatus.REJECTED;
        expense.adminResponse = new Date();
      }

      await manager.save(Expense, expenses);
      return true;
    });
  }
  async paidExpenses(ids: number[], updatedBy: number): Promise<boolean> {
    return await this.dataSource.transaction(async (manager) => {
      const expenses = await manager.find(Expense, {
        where: { id: In(ids), status: ExpenseStatus.APPROVED },
      });

      if (expenses.length !== ids.length) {
        throw new NotFoundException(
          'Some expenses were not found or are not approved',
        );
      }

      for (const expense of expenses) {
        expense.status = ExpenseStatus.PAID;
        expense.paidAt = new Date();
        expense.updatedBy = updatedBy;
        expense.updatedAt = new Date();
      }

      await manager.save(Expense, expenses);
      return true;
    });
  }
}
