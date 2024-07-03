import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from './entities/bank-account.entity';
import { CreateBankAccountInput } from './dto/create-bank-account.input';
import { UpdateBankAccountInput } from './dto/update-bank-account.input';
import { Company } from '../company/entities/company.entity';

@Injectable()
export class BankAccountService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(createBankAccountInput: CreateBankAccountInput) {
    const { name, companyId, accountNumber } = createBankAccountInput;
    await this.companyRepository.findOneByOrFail({
      id: companyId,
    });
    const bankAccount = this.bankAccountRepository.create({
      name,
      accountNumber,
      companyId,
    });

    return this.bankAccountRepository.save(bankAccount);
  }

  findAll(): Promise<BankAccount[]> {
    return this.bankAccountRepository.find();
  }

  async findOne(id: number): Promise<BankAccount> {
    const bankAccount = await this.bankAccountRepository.findOneBy({ id });
    if (!bankAccount) {
      throw new NotFoundException(`BankAccount with ID ${id} not found`);
    }
    return bankAccount;
  }

  async update(
    id: number,
    updateBankAccountInput: UpdateBankAccountInput,
  ): Promise<BankAccount | null> {
    const bankAccount = await this.bankAccountRepository.findOneBy({ id });

    if (!bankAccount) {
      throw new NotFoundException(`BankAccount with ID ${id} not found`);
    }

    Object.assign(bankAccount, updateBankAccountInput);

    return this.bankAccountRepository.save(bankAccount);
  }

  async remove(id: number): Promise<void> {
    const bankAccount = await this.findOne(id);
    await this.bankAccountRepository.remove(bankAccount);
  }
}
