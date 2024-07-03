import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseSubCategoryService } from './expense-sub-category.service';
import { ExpenseSubCategoryResolver } from './expense-sub-category.resolver';
import { ExpenseSubCategory } from './expense-sub-category.entity';
import { ExpenseCategory } from '../expense-category/expense-category.entity';
import { ExpenseCategoryService } from '../expense-category/expense-category.service';
import { ExpenseCategoryResolver } from '../expense-category/expense-category.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([ExpenseCategory, ExpenseSubCategory])],
  providers: [ExpenseCategoryService, ExpenseCategoryResolver, ExpenseSubCategoryService, ExpenseSubCategoryResolver],
})
export class ExpenseSubCategoryModule {}
