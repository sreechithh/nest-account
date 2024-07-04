import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountService } from './bank-account.service';
import { BankAccountResolver } from './bank-account.resolver';
import { BankAccount } from './entities/bank-account.entity';
import { JwtService } from '@nestjs/jwt';
import { Company } from '../company/entities/company.entity';
import { IsUniqueConstraint } from '../common/decorators/unique.validator';

@Module({
  imports: [TypeOrmModule.forFeature([BankAccount, Company])],
  providers: [
    BankAccountService,
    BankAccountResolver,
    JwtService,
    IsUniqueConstraint,
  ],
})
export class BankAccountModule {}
