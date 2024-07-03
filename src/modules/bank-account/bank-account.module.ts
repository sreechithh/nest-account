import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountService } from './bank-account.service';
import { BankAccountResolver } from './bank-account.resolver';
import { BankAccount } from './entities/bank-account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BankAccount])],
  providers: [BankAccountService, BankAccountResolver],
})
export class BankAccountModule {}