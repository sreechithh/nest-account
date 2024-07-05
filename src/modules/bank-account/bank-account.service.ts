import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BankAccount } from './entities/bank-account.entity';
import { CreateBankAccountInput } from './dto/create-bank-account.input';
import { UpdateBankAccountInput } from './dto/update-bank-account.input';
import { Company } from '../company/entities/company.entity';
import { User } from '../users/entities/user.entity';
import {
  BankTransaction,
  TransactionType,
} from '../bank-transactions/entities/bank-transaction.entity';

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

  async create(
    user: User,
    createBankAccountInput: CreateBankAccountInput,
  ): Promise<any> {
    const { name, companyId, accountNumber, bankBalance } =
      createBankAccountInput;

    return await this.dataSource.transaction(async (manager) => {
      const company = await manager.findOneOrFail(Company, {
        where: { id: companyId },
      });
      const bankAccount = manager.create(BankAccount, {
        name,
        accountNumber,
        company,
        createdBy: user.id,
        updatedBy: user.id,
      });
      const bankEntity = await manager.save(BankAccount, bankAccount);
      const bankTransaction = manager.create(BankTransaction, {
        bankId: bankEntity.id,
        amount: bankBalance,
        type: TransactionType.CREDIT,
        createdBy: user.id,
        comment: 'initial balance',
      });
      await manager.save(BankTransaction, bankTransaction);
      const savedBankEntity = await manager.findOneOrFail(BankAccount, {
        where: { id: bankEntity.id },
        relations: ['bankTransactions'],
      });
      const netBalance = this.getBankBalance(bankEntity.id);

      return { ...savedBankEntity, bankBalance: netBalance };
    });
  }

  // findAll(): Promise<BankAccount[]> {
  //   return this.bankAccountRepository.find();
  // }

  async findAll(): Promise<any[]> {
    const bankAccounts = await this.bankAccountRepository.find({
      relations: ['bankTransactions'], // Assuming 'bankTransactions' is the relation name
    });

    return await Promise.all(
      bankAccounts.map(async (bankAccount) => {
        const netBalance = await this.getBankBalance(bankAccount.id);
        return { ...bankAccount, bankBalance: netBalance };
      }),
    );
  }

  async findOne(id: number): Promise<any> {
    const bankAccount = await this.bankAccountRepository.findOneBy({ id });
    if (!bankAccount) {
      throw new NotFoundException(`BankAccount with ID ${id} not found`);
    }
    const netBalance = this.getBankBalance(bankAccount.id);

    return { ...bankAccount, bankBalance: netBalance };
  }

  async update(
    user: User,
    updateBankAccountInput: UpdateBankAccountInput,
  ): Promise<BankAccount | null> {
    //tomo
    const { id, accountNumber, companyId, name } = updateBankAccountInput;
    const company = await this.companyRepository.findOneByOrFail({
      id: companyId,
    });

    const bankAccount = await this.bankAccountRepository.preload({
      id,
      accountNumber,
      company,
      name,
      updatedBy: user.id,
    });

    if (!bankAccount) {
      throw new NotFoundException(`BankAccount with ID ${id} not found`);
    }
    const savedBankEntity = this.bankAccountRepository.save(bankAccount);
    const netBalance = this.getBankBalance(id);

    return { ...savedBankEntity, bankBalance: netBalance };
  }

  async remove(id: number): Promise<void> {
    const bankAccount = await this.findOne(id);
    await this.bankAccountRepository.remove(bankAccount);
  }

  async getBankBalance(bankId: number): Promise<number> {
    const result = await this.bankTransactionRepository
      .createQueryBuilder('transaction')
      .select(
        'SUM(CASE WHEN transaction.type = :credit THEN transaction.amount ELSE 0 END) - SUM(CASE WHEN transaction.type = :debit THEN transaction.amount ELSE 0 END)',
        'netBalance',
      )
      .where('transaction.bankId = :bankId', { bankId: bankId })
      .setParameters({
        credit: TransactionType.CREDIT,
        debit: TransactionType.DEBIT,
      })
      .getRawOne();

    return parseFloat(result.netBalance) || 0;
  }
}
