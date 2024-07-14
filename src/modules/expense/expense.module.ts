import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseService } from './expense.service';
import { ExpenseResolver } from './expense.resolver';
import { Expense } from './entities/expense.entity';
import { EmployeeExpense } from '../employee-expense/entities/employee-expense.entity';
import { ExpenseCategory } from '../expense-category/entities/expense-category.entity';
import { ExpenseSubCategory } from '../expense-sub-category/entities/expense-sub-category.entity';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { BankTransaction } from '../bank-transactions/entities/bank-transaction.entity';
import { BankAccount } from '../bank-account/entities/bank-account.entity';
import { BankTransactionsModule } from '../bank-transactions/bank-transactions.module';
import { Company } from '../company/entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Expense,
      ExpenseCategory,
      ExpenseSubCategory,
      User,
      EmployeeExpense,
      BankTransaction,
      BankAccount,
      Company,
    ]),
    BankTransactionsModule,
  ],
  providers: [ExpenseService, ExpenseResolver, JwtService],
})
export class ExpenseModule {}
