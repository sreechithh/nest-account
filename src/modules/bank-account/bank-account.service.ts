import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from './entities/bank-account.entity';
import { CreateBankAccountInput } from './dto/create-bank-account.input';
import { UpdateBankAccountInput } from './dto/update-bank-account.input';

@Injectable()
export class BankAccountService {
  constructor(
    @InjectRepository(BankAccount)
    private bankAccountRepository: Repository<BankAccount>,
  ) {}

  create(createBankAccountInput: CreateBankAccountInput): Promise<BankAccount> {
    const bankAccount = this.bankAccountRepository.create(createBankAccountInput);
    return this.bankAccountRepository.save(bankAccount);
  }

  findAll(): Promise<BankAccount[]> {
    return this.bankAccountRepository.find();
  }

  findOne(id: number): Promise<BankAccount | null> {
    return this.bankAccountRepository.findOneBy({ id });
  }

  async update(id: number, updateBankAccountInput: UpdateBankAccountInput): Promise<BankAccount | null> {
    await this.bankAccountRepository.update(id, updateBankAccountInput);
    return this.bankAccountRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.bankAccountRepository.delete(id);
  }
}