import { Module } from '@nestjs/common';
import { BankTransactionsService } from './bank-transactions.service';
import { BankTransactionsResolver } from './bank-transactions.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankTransaction } from './entities/bank-transaction.entity';
import { BankAccount } from '../bank-account/entities/bank-account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BankTransaction, BankAccount])],
  providers: [BankTransactionsResolver, BankTransactionsService],
})
export class BankTransactionsModule {}
