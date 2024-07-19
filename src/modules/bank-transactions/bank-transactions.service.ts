import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateBankTransactionInput } from './dto/create-bank-transaction.input';
import { User } from '../users/entities/user.entity';
import { BankTransaction } from './entities/bank-transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { BankAccountService } from '../bank-account/bank-account.service';
import { BankAccount } from '../bank-account/entities/bank-account.entity';
import {
  CommonBankTransactionResponse,
  PaginatedBankTransactionResponse,
} from './dto/bank-transaction-response.dto';
import { CommonExpenseCategoryResponse } from '../expense-category/dto/expense-category-response.dto';
import { CommonBankAccountResponse } from '../bank-account/dto/bank-account-response.dto';

@Injectable()
export class BankTransactionsService {
  constructor(
    @InjectRepository(BankTransaction)
    private readonly bankTransactionRepository: Repository<BankTransaction>,
    private readonly bankAccountService: BankAccountService,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
  ) {}
  async create(
    user: User,
    createBankTransactionInput: CreateBankTransactionInput,
  ): Promise<CommonBankTransactionResponse> {
    const { bankId, amount, comment, type } = createBankTransactionInput;

    return this.bankAccountRepository
      .findOneByOrFail({ id: bankId })
      .then(() => {
        const bankTransaction = this.bankTransactionRepository.create({
          bankId,
          amount,
          type,
          createdBy: user.id,
          comment,
        });
        return this.bankTransactionRepository.save(bankTransaction);
      })
      .then((savedBankTransaction) => {
        return Promise.all([
          this.bankAccountService.getBankBalance(bankId),
          this.bankTransactionRepository.findOneOrFail({
            where: { id: savedBankTransaction.id },
            relations: ['bankAccount', 'createdByUser'],
          }),
        ]).then(([netBalance, bankTransaction]) => {
          return {
            statusCode: 201,
            message: 'Bank Transactions created successfully',
            data: bankTransaction,
          };
        });
      })
      .catch(() => {
        throw new HttpException(
          `Bank Account with ID ${bankId} not found`,
          HttpStatus.NOT_FOUND,
        );
      });
  }

  async findAll(
    perPage: number,
    page: number,
  ): Promise<PaginatedBankTransactionResponse> {
    const options: FindManyOptions<BankTransaction> = {
      take: perPage,
      skip: (page - 1) * perPage,
      relations: ['bankAccount', 'createdByUser'],
      order: { id: 'DESC' },
    };

    const [transactions, totalRows] =
      await this.bankTransactionRepository.findAndCount(options);
    const data = await Promise.all(
      transactions.map(async (transaction) => {
        const netBalance = await this.bankAccountService.getBankBalance(
          transaction.bankAccount.id,
        );
        return { ...transaction, bankBalance: netBalance };
      }),
    );
    const totalPages = Math.ceil(totalRows / perPage);

    return {
      data,
      totalRows,
      totalPages,
      currentPage: page,
      statusCode: 200,
      message: 'Bank Transactions fetched successfully',
    };
  }

  async findOne(id: number): Promise<CommonBankTransactionResponse> {
    return await this.bankTransactionRepository
      .findOneOrFail({
        where: { id },
      })
      .then((data) => {
        return {
          data,
          statusCode: 200,
          message: 'Transaction fetched successfully',
        };
      })
      .catch(() => {
        throw new HttpException(
          `Transaction with ID ${id} was not found`,
          HttpStatus.NOT_FOUND,
        );
      });
  }

  async remove(id: number): Promise<CommonBankTransactionResponse> {
    return this.bankTransactionRepository
      .findOneByOrFail({ id })
      .then((bankTransaction) => {
        return this.bankTransactionRepository
          .remove(bankTransaction)
          .then(() => ({
            statusCode: 200,
            message: 'Bank Transaction deleted successfully',
          }));
      })
      .catch(() => {
        throw new HttpException(
          `Bank Transaction with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      });
  }
}
