import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseCategoryService } from './expense-category.service';
import { ExpenseCategoryResolver } from './expense-category.resolver';
import { ExpenseCategory } from './entities/expense-category.entity';
import { ExpenseSubCategory } from '../expense-sub-category/entities/expense-sub-category.entity';
import { ExpenseSubCategoryService } from '../expense-sub-category/expense-sub-category.service';
import { ExpenseSubCategoryResolver } from '../expense-sub-category/expense-sub-category.resolver';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([ExpenseCategory, ExpenseSubCategory])],
  providers: [
    ExpenseCategoryService,
    ExpenseCategoryResolver,
    ExpenseSubCategoryService,
    ExpenseSubCategoryResolver,
    JwtService,
  ],
})
export class ExpenseCategoryModule {}
