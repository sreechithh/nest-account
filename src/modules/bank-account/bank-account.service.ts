import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, FindManyOptions } from 'typeorm';
import { BankAccount } from './entities/bank-account.entity';
import { CreateBankAccountInput } from './dto/create-bank-account.input';
import { UpdateBankAccountInput } from './dto/update-bank-account.input';
import { Company } from '../company/entities/company.entity';
import { User } from '../users/entities/user.entity';
import {
  BankTransaction,
  TransactionType,
} from '../bank-transactions/entities/bank-transaction.entity';
import {
  CommonBankAccountResponse,
  PaginatedBankAccountResponse,
} from './dto/bank-account-response.dto';

@Injectable()
export class BankAccountService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(BankTransaction)
    private readonly bankTransactionRepository: Repository<BankTransaction>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}
  async getBankBalance(bankId: number): Promise<number> {
    const credited = await this.bankTransactionRepository.sum('amount', {
      bankId,
      type: TransactionType.CREDIT,
    });
    const debited = await this.bankTransactionRepository.sum('amount', {
      bankId,
      type: TransactionType.DEBIT,
    });
    const total = (credited ?? 0) - (debited ?? 0);

    return total || 0;
  }

  async create(
    user: User,
    createBankAccountInput: CreateBankAccountInput,
  ): Promise<CommonBankAccountResponse> {
    const { name, companyId, accountNumber } = createBankAccountInput;

    return this.companyRepository
      .findOne({
        where: { id: companyId },
      })
      .then((company) => {
        if (!company) {
          throw new NotFoundException(`Company with ID ${companyId} not found`);
        }
        const bankAccount = this.bankAccountRepository.create({
          name,
          accountNumber,
          company,
          createdBy: user.id,
          updatedBy: user.id,
        });

        return this.bankAccountRepository.save(bankAccount);
      })
      .then(() => ({
        statusCode: 201,
        message: 'Bank Account created successfully',
      }))
      .catch((error) => {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new HttpException(
          'Validation failed or an unexpected error occurred',
          HttpStatus.BAD_REQUEST,
        );
      });
  }

  async findAll(
    perPage: number,
    page: number,
  ): Promise<PaginatedBankAccountResponse> {
    const options: FindManyOptions<BankAccount> = {
      take: perPage,
      skip: (page - 1) * perPage,
      relations: ['bankTransactions'],
      order: { id: 'DESC' },
    };

    const [bankAccounts, totalRows] =
      await this.bankAccountRepository.findAndCount(options);

    const data = await Promise.all(
      bankAccounts.map(async (bankAccount) => {
        const netBalance = await this.getBankBalance(bankAccount.id);

        return { ...bankAccount, bankBalance: netBalance };
      }),
    );
    const totalPages = Math.ceil(totalRows / perPage);

    return {
      data,
      totalRows,
      totalPages,
      currentPage: page,
      statusCode: 200,
      message: 'Bank Accounts fetched successfully',
    };
  }

  async findOne(id: number): Promise<CommonBankAccountResponse> {
    return this.bankAccountRepository
      .findOneBy({ id })
      .then((bankAccount) => {
        if (!bankAccount) {
          throw new NotFoundException(`Bank Account with ID ${id} not found`);
        }

        return this.getBankBalance(bankAccount.id).then((netBalance) => {
          bankAccount.bankBalance = netBalance;

          return {
            data: bankAccount,
            statusCode: 200,
            message: 'Bank Account fetched successfully',
          };
        });
      })
      .catch((error) => {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new HttpException(
          'An unexpected error occurred',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
  }

  async update(
    user: User,
    updateBankAccountInput: UpdateBankAccountInput,
  ): Promise<CommonBankAccountResponse> {
    const { id, accountNumber, companyId, name, isActive } =
      updateBankAccountInput;

    return this.companyRepository
      .findOneBy({ id: companyId })
      .then((company) => {
        if (!company) {
          throw new NotFoundException(`Company with ID ${companyId} not found`);
        }

        return this.bankAccountRepository.findOne({
          where: { id },
          relations: ['bankTransactions', 'company'],
        });
      })
      .then((bankAccount) => {
        if (!bankAccount) {
          throw new NotFoundException(`Bank Account with ID ${id} not found`);
        }

        bankAccount.accountNumber = accountNumber;
        bankAccount.company = bankAccount.company;
        bankAccount.name = name;
        bankAccount.isActive = isActive;
        bankAccount.updatedBy = user.id;

        return this.bankAccountRepository.save(bankAccount);
      })
      .then((savedBankEntity) => {
        return this.getBankBalance(id).then((netBalance) => {
          return {
            data: { ...savedBankEntity, bankBalance: netBalance },
            statusCode: 200,
            message: 'Bank Account updated successfully',
          };
        });
      })
      .catch((error) => {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new HttpException(
          'An unexpected error occurred',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
  }

  async remove(id: number): Promise<CommonBankAccountResponse> {
    return this.bankAccountRepository
      .findOneByOrFail({ id })
      .then((bankAccount) => {
        return this.bankAccountRepository.remove(bankAccount).then(() => ({
          statusCode: 200,
          message: 'Bank Account deleted successfully',
        }));
      })
      .catch(() => {
        throw new HttpException(
          `Bank Account with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      });
  }
}
