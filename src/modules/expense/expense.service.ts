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
import { UserRoles } from '../roles/entities/role.entity';
import { BankTransaction } from '../bank-transactions/entities/bank-transaction.entity';
import { BankAccount } from '../bank-account/entities/bank-account.entity';
import { Company } from '../company/entities/company.entity';

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
    @InjectRepository(BankTransaction)
    private bankTransactionRepository: Repository<BankTransaction>,
    @InjectRepository(BankAccount)
    private bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
        companyId,
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
      const company = await manager.findOne(Company, {
        where: { id: companyId },
      });
      if (!company) {
        throw new NotFoundException(`Company with ID ${companyId} not found`);
      }

      const expenseSubCategory = await manager.findOneOrFail(
        ExpenseSubCategory,
        {
          where: { id: expenseSubCategoryId },
        },
      );
      const bank = await manager.findOneOrFail(BankAccount, {
        where: { id: bankId },
      });

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
        company,
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
          employee.roles.some((role) => role.name === UserRoles.EMPLOYEE)
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
        companyId,
        expenseCategoryId,
        expenseSubCategoryId,
        paidDate,
        employeeId,
        bankId,
        ...expenseData
      } = updateExpenseInput;

      const expense = await manager.findOne(Expense, {
        where: { id },
        relations: ['bankTransaction', 'employeeExpense'],
      });

      if (!expense) {
        throw new NotFoundException(`Expense with ID ${id} Not Found`);
      }

      if (
        expense.status === ExpenseStatus.APPROVED ||
        expense.status === ExpenseStatus.REJECTED ||
        expense.adminResponse
      ) {
        throw new Error(
          'Expense Approved or Rejected by the admin cannot be updated',
        );
      }

      const originalCategoryId = expense.expenseCategoryId;
      const isCategoryChanged = originalCategoryId !== expenseCategoryId;

      const expenseCategory = await manager.findOne(ExpenseCategory, {
        where: { id: expenseCategoryId },
      });
      if (!expenseCategory) {
        throw new NotFoundException(
          `ExpenseCategory with ID ${expenseCategoryId} Not Found,`,
        );
      }
      const company = await manager.findOne(Company, {
        where: { id: companyId },
      });
      if (!company) {
        throw new NotFoundException(`Company with ID ${companyId} Not Found`);
      }

      const expenseSubCategory = await manager.findOne(ExpenseSubCategory, {
        where: { id: expenseSubCategoryId },
      });
      if (!expenseSubCategory) {
        throw new NotFoundException(
          `ExpenseSubCategory with ID ${expenseSubCategoryId} Not Found`,
        );
      }

      const bank = bankId
        ? await this.bankAccountRepository.findOne({
            where: { id: bankId },
          })
        : null;
      if (bankId && !bank) {
        throw new NotFoundException(`Bank Account with ID ${bankId} not found`);
      }

      if (expense.bankTransaction) {
        await manager.remove(BankTransaction, expense.bankTransaction);
      }
      if (bank) {
        const newBankTransaction = this.bankTransactionRepository.create({
          bankId: bank.id,
          amount: expenseData.amount,
          comment: expenseData.comments || 'Updated expense payment',
          type: 'debit',
          createdBy: updatedBy,
        });

        await this.bankTransactionRepository.save(newBankTransaction);
        expense.bankTransaction = newBankTransaction;
      }
      Object.assign(expense, {
        ...expenseData,
        company,
        expenseCategory,
        expenseSubCategory,
        paidDate,
        updatedBy,
        updatedAt: new Date(),
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
          employee.roles.some((role) => role.name === UserRoles.EMPLOYEE)
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

  async remove(
    id: number,
  ): Promise<{ statusCode: number; message: string; data: Expense }> {
    return await this.dataSource.transaction(async (manager) => {
      const expense = await manager.findOne(Expense, {
        where: { id },
        relations: ['employeeExpense', 'bankTransaction'],
      });

      if (!expense) {
        throw new NotFoundException(`Expense with ID ${id} not found`);
      }

      if (expense.employeeExpense) {
        await manager.remove(EmployeeExpense, expense.employeeExpense);
      }

      if (expense.bankTransaction) {
        await manager.remove(BankTransaction, expense.bankTransaction);
      }

      await manager.remove(Expense, expense);

      return {
        statusCode: 200,
        message: 'Expense deleted successfully',
        data: expense,
      };
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
  async calculateExpense(
    month: number | null = null,
    year: number | null = null,
    startDate: Date | null = null,
    endDate: Date | null = null,
    companyId: number | null = null,
  ): Promise<number> {
    const query = this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total');

    if (month !== null) {
      query.andWhere('EXTRACT(MONTH FROM expense.paidAt) = :month', { month });
    }

    if (year !== null) {
      query.andWhere('EXTRACT(YEAR FROM expense.paidAt) = :year', { year });
    }
    if (startDate !== null && endDate !== null) {
      query.andWhere('expense.paidAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (companyId !== null) {
      query.andWhere('expense.companyId = :companyId', { companyId });
    }

    const result = await query.getRawOne();
    return result?.total || 0;
  }
}
