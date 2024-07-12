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
    const { name, companyId, accountNumber } = createBankAccountInput;

    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

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

    return await this.bankAccountRepository.save(bankAccount);
  }

  async findAll(): Promise<any[]> {
    const bankAccounts = await this.bankAccountRepository.find({
      relations: ['bankTransactions'],
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
    const { id, accountNumber, companyId, name, isActive } =
      updateBankAccountInput;
    const company = await this.companyRepository.findOneByOrFail({
      id: companyId,
    });
    const bankAccount = await this.bankAccountRepository.findOneOrFail({
      where: { id },
      relations: ['bankTransactions', 'company'],
    });
    bankAccount.id = id;
    bankAccount.accountNumber = accountNumber;
    bankAccount.company = company;
    bankAccount.name = name;
    bankAccount.isActive = isActive;
    bankAccount.updatedBy = user.id;
    const savedBankEntity = await this.bankAccountRepository.save(bankAccount);
    const netBalance = await this.getBankBalance(id);

    return { ...savedBankEntity, bankBalance: netBalance };
  }

  async remove(id: number): Promise<void> {
    const bankAccount = await this.bankAccountRepository.findOneByOrFail({
      id,
    });
    await this.bankAccountRepository.remove(bankAccount);
  }

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
}
