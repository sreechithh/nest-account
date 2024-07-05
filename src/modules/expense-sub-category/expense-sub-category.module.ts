import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseSubCategoryService } from './expense-sub-category.service';
import { ExpenseSubCategoryResolver } from './expense-sub-category.resolver';
import { ExpenseSubCategory } from './entities/expense-sub-category.entity';
import { ExpenseCategory } from '../expense-category/entities/expense-category.entity';
import { ExpenseCategoryService } from '../expense-category/expense-category.service';
import { ExpenseCategoryResolver } from '../expense-category/expense-category.resolver';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([ExpenseCategory, ExpenseSubCategory])],
  providers: [ExpenseCategoryService, ExpenseCategoryResolver, ExpenseSubCategoryService, ExpenseSubCategoryResolver, JwtService],
})
export class ExpenseSubCategoryModule {}
