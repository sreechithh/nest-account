import { Injectable, NotFoundException } from '@nestjs/common';
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
    await this.bankAccountRepository.findOneByOrFail({
      id: bankId,
    });
    const bankTransaction = this.bankTransactionRepository.create({
      bankId,
      amount,
      type,
      createdBy: user.id,
      comment,
    });
    const savesBankTransaction =
      await this.bankTransactionRepository.save(bankTransaction);
    const netBalance = this.bankAccountService.getBankBalance(bankId);
    const bankTransactions = await this.bankTransactionRepository.findOneOrFail(
      {
        where: { id: savesBankTransaction.id },
        relations: ['bankAccount', 'createdByUser'],
      },
    );

    return {
      statusCode: 201,
      message: 'Bank Transactions created successfully',
    };
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
    const bankTransaction = await this.bankTransactionRepository.findOneBy({
      id,
    });
    if (!bankTransaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    const netBalance = await this.bankAccountService.getBankBalance(
      bankTransaction.id,
    );

    return {
      data: { ...bankTransaction, bankBalance: netBalance },
      statusCode: 200,
      message: 'Transaction fetched successfully',
    };
  }

  async remove(id: number): Promise<CommonBankTransactionResponse> {
    const bankTransaction =
      await this.bankTransactionRepository.findOneByOrFail({
        id,
      });
    await this.bankTransactionRepository.remove(bankTransaction);

    return {
      statusCode: 200,
      message: 'Transaction deleted successfully',
    };
  }
}
