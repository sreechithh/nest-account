import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import {
  CommonExpenseResponse,
  PaginatedExpenseResponse,
} from './dto/expense-response.dto';

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
  ): Promise<CommonExpenseResponse> {
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

      const [expenseCategory, expenseSubCategory, company, bank] =
        await this.checkExpenseParentExists(
          expenseCategoryId,
          expenseSubCategoryId,
          companyId,
          bankId,
        );

      const finalStatus = isPaymentRequest
        ? ExpenseStatus.PENDING
        : ExpenseStatus.PAID;

      const paidAt = finalStatus === ExpenseStatus.PAID ? new Date() : null;
      const checkPaidDate =
        finalStatus === ExpenseStatus.PAID ? paidDate : null;

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
        paidDate: checkPaidDate,
        bankTransactionId: bankTransactionId || undefined,
      });

      const savedExpense = await manager.save(Expense, expense);

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

          // const newExpense = await manager.findOne(Expense, {
          //   where: { id: savedExpense.id },
          //   relations: [
          //     'expenseCategory',
          //     'expenseSubCategory',
          //     'bankTransaction',
          //     'company',
          //     'employeeExpense',
          //     'employeeExpense.user',
          //   ],
          // });
          // if (newExpense) {
          //   savedExpense = newExpense;
          // }
        }
      }

      return {
        statusCode: 201,
        message: 'Expense created successfully',
      };
    });
  }

  async findAll(
    perPage: number,
    page: number,
  ): Promise<PaginatedExpenseResponse> {
    const options: FindManyOptions<Expense> = {
      take: perPage,
      skip: (page - 1) * perPage,
      relations: [
        'expenseCategory',
        'expenseSubCategory',
        'employeeExpense',
        'employeeExpense.user',
        'bankTransaction',
        'bankTransaction.bankAccount',
        'company',
      ],
      order: { id: 'DESC' },
    };

    const [data, totalRows] =
      await this.expenseRepository.findAndCount(options);
    const totalPages = Math.ceil(totalRows / perPage);

    return {
      data,
      totalRows,
      totalPages,
      currentPage: page,
      statusCode: 200,
      message: 'Expenses fetched successfully',
    };
  }

  async findOne(id: number): Promise<CommonExpenseResponse> {
    return await this.expenseRepository
      .findOneOrFail({
        where: { id },
        relations: [
          'expenseCategory',
          'expenseSubCategory',
          'employeeExpense',
          'employeeExpense.user',
          'bankTransaction',
          'bankTransaction.bankAccount',
          'company',
        ],
      })
      .then((data) => {
        return {
          data,
          statusCode: 200,
          message: 'Expense fetched successfully',
        };
      })
      .catch(() => {
        throw new HttpException(
          `Expense with ID ${id} was not found`,
          HttpStatus.NOT_FOUND,
        );
      });
  }

  async update(
    id: number,
    updateExpenseInput: UpdateExpenseInput,
    updatedBy: number,
  ): Promise<CommonExpenseResponse> {
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
      const [expenseCategory, expenseSubCategory, company, bank] =
        await this.checkExpenseParentExists(
          expenseCategoryId,
          expenseSubCategoryId,
          companyId,
          bankId,
        );

      const originalCategoryId = expense.expenseCategoryId;
      const isCategoryChanged = originalCategoryId !== expenseCategoryId;

      if (!bankId) {
        await manager.remove(BankTransaction, expense.bankTransaction);
      }

      if (bank && expense.bankTransaction) {
        await manager.remove(BankTransaction, expense.bankTransaction);
        const newBankTransaction = this.bankTransactionRepository.create({
          bankId,
          amount: expenseData.amount,
          comment: expenseData.comments || 'Updated expense payment',
          type: 'debit',
          createdBy: updatedBy,
        });

        await this.bankTransactionRepository.save(newBankTransaction);
        expense.bankTransaction = newBankTransaction;
      }

      if (!expense.bankTransaction) {
        const newBankTransaction = this.bankTransactionRepository.create({
          bankId,
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

      if (
        isCategoryChanged &&
        expense.employeeExpense &&
        expense.employeeExpense.id != employeeId
      ) {
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

      // const updatedExpenseWithRelations = await manager.findOne(Expense, {
      //   where: { id: updatedExpense.id },
      //   relations: [
      //     'expenseCategory',
      //     'expenseSubCategory',
      //     'employeeExpense',
      //     'employeeExpense.user',
      //     'bankTransaction',
      //     'company',
      //   ],
      // });
      //
      // if (!updatedExpenseWithRelations) {
      //   throw new Error(`Failed to retrieve updated expense with ID ${id}.`);
      // }

      return {
        statusCode: 200,
        message: 'Expense updated successfully',
      };
    });
  }

  async remove(id: number): Promise<CommonExpenseResponse> {
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
        // data: expense,
      };
    });
  }
  async approveExpenses(ids: number[]): Promise<CommonExpenseResponse> {
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

      return {
        statusCode: 200,
        message: 'Expense approved successfully',
      };
    });
  }

  async rejectExpenses(ids: number[]): Promise<CommonExpenseResponse> {
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

      return {
        statusCode: 200,
        message: 'Expense rejected successfully',
      };
    });
  }
  async paidExpenses(
    ids: number[],
    updatedBy: number,
  ): Promise<CommonExpenseResponse> {
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

      return {
        statusCode: 200,
        message: 'Expense moved to paid successfully',
      };
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
      // query.andWhere('expense.paidAt BETWEEN :startDate AND :endDate', {
      //   startDate,
      //   endDate,
      // });
      query.andWhere(
        'expense.paidAt >= :startDate AND expense.paidAt <= :endDate',
        {
          startDate,
          endDate,
        },
      );
    }

    if (companyId !== null) {
      query.andWhere('expense.companyId = :companyId', { companyId });
    }

    const result = await query.getRawOne();

    return result?.total || 0;
  }
  private async checkExpenseParentExists(
    expenseCategoryId: number | undefined,
    expenseSubCategoryId: number | undefined,
    companyId: number | undefined,
    bankId: number | undefined,
  ) {
    return await Promise.all([
      this.expenseCategoryRepository
        .findOneByOrFail({
          id: expenseCategoryId,
        })
        .catch(() => {
          throw new HttpException(
            `Expense category with ID ${expenseCategoryId} was not found`,
            HttpStatus.NOT_FOUND,
          );
        }),
      this.expenseSubCategoryRepository
        .findOneByOrFail({
          id: expenseSubCategoryId,
        })
        .catch(() => {
          throw new HttpException(
            `Expense sub-category with ID ${expenseSubCategoryId} was not found`,
            HttpStatus.NOT_FOUND,
          );
        }),
      this.companyRepository
        .findOneByOrFail({
          id: companyId,
        })
        .catch(() => {
          throw new HttpException(
            `Company with ID ${companyId} was not found`,
            HttpStatus.NOT_FOUND,
          );
        }),
      bankId
        ? this.bankAccountRepository
            .findOneByOrFail({ id: bankId })
            .catch(() => {
              throw new HttpException(
                `Bank with ID ${bankId} was not found`,
                HttpStatus.NOT_FOUND,
              );
            })
        : Promise.resolve(null),
    ]);
  }
}
