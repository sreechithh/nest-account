import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBankTransactionInput } from './dto/create-bank-transaction.input';
import { User } from '../users/entities/user.entity';
import { BankTransaction } from './entities/bank-transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { BankAccountService } from '../bank-account/bank-account.service';
import { BankAccount } from '../bank-account/entities/bank-account.entity';

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
  ) {
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
    return { ...bankTransactions, bankBalance: netBalance };
  }

  async findAll(
    pageSize: number = 10,
    pageNumber: number = 1,
    searchQuery?: string,
  ): Promise<BankTransaction[]> {
    const options: FindManyOptions<BankTransaction> = {
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
      relations: ['bankAccount', 'createdByUser'],
    };
    const transactions = await this.bankTransactionRepository.find(options);

    return await Promise.all(
      transactions.map(async (transaction) => {
        const netBalance = await this.bankAccountService.getBankBalance(
          transaction.bankAccount.id,
        );
        return { ...transaction, bankBalance: netBalance };
      }),
    );
  }
  async findOne(id: number): Promise<any> {
    const bankAccount = await this.bankTransactionRepository.findOneBy({ id });
    if (!bankAccount) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    const netBalance = this.bankAccountService.getBankBalance(bankAccount.id);

    return { ...bankAccount, bankBalance: netBalance };
  }

  async remove(id: number): Promise<string> {
    const bankTransaction =
      await this.bankTransactionRepository.findOneByOrFail({
        id,
      });
    await this.bankTransactionRepository.remove(bankTransaction);

    return `Transaction id with ${id} has been removed`;
  }
}
