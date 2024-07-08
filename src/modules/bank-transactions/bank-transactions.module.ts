import { Module } from '@nestjs/common';
import { BankTransactionsService } from './bank-transactions.service';
import { BankTransactionsResolver } from './bank-transactions.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankTransaction } from './entities/bank-transaction.entity';
import { BankAccount } from '../bank-account/entities/bank-account.entity';
import { BankAccountService } from '../bank-account/bank-account.service';
import { Company } from '../company/entities/company.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BankTransaction,
      BankAccount,
      Company,
      BankAccountService,
    ]),
  ],
  providers: [
    BankTransactionsResolver,
    BankTransactionsService,
    BankAccountService,
    JwtService,
  ],
  exports: [BankTransactionsResolver, BankTransactionsService],
})
export class BankTransactionsModule {}
