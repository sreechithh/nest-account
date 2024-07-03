import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseSubCategory } from './expense-sub-category.entity';
import { ExpenseCategory } from '../expense-category/expense-category.entity';
import { CreateExpenseSubCategoryInput } from './dto/create-expense-sub-category.input';
import { UpdateExpenseSubCategoryInput } from './dto/update-expense-sub-category.input';

@Injectable()
export class ExpenseSubCategoryService {
  constructor(
    @InjectRepository(ExpenseSubCategory)
    private expenseSubCategoryRepository: Repository<ExpenseSubCategory>,
    @InjectRepository(ExpenseCategory)
    private expenseCategoryRepository: Repository<ExpenseCategory>,
  ) {}

  async create(createExpenseSubCategoryInput: CreateExpenseSubCategoryInput): Promise<ExpenseSubCategory> {
    const expenseCategory = await this.expenseCategoryRepository.findOneBy({ id:createExpenseSubCategoryInput.expenseCategoryId});
    if (!expenseCategory) {
      throw new NotFoundException(`ExpenseCategory with ID ${createExpenseSubCategoryInput.expenseCategoryId} not found`);
    }

    const expenseSubCategory = this.expenseSubCategoryRepository.create({
      name: createExpenseSubCategoryInput.name,
      expenseCategory: expenseCategory,
      isActive: createExpenseSubCategoryInput.isActive
    });

    return this.expenseSubCategoryRepository.save(expenseSubCategory);
  }

  findAll(): Promise<ExpenseSubCategory[]> {
    return this.expenseSubCategoryRepository.find({ relations: ['expenseCategory'] });
  }

  async findOne(id: number): Promise<ExpenseSubCategory> {
    const expenseSubCategory = await this.expenseSubCategoryRepository.findOne({ where: { id }, relations: ['expenseCategory'] });
    if (!expenseSubCategory) {
      throw new NotFoundException(`ExpenseSubCategory with ID ${id} not found`);
    }
    return expenseSubCategory;
  }

  async update(updateExpenseSubCategoryInput: UpdateExpenseSubCategoryInput): Promise<ExpenseSubCategory> {
    const { id, expenseCategoryId, ...updateData } = updateExpenseSubCategoryInput;

    const expenseSubCategory = await this.expenseSubCategoryRepository.findOne({ where: { id } });
    if (!expenseSubCategory) {
      throw new NotFoundException(`ExpenseSubCategory with ID ${id} not found`);
    }

    if (expenseCategoryId) {
      const expenseCategory = await this.expenseCategoryRepository.findOne({ where: { id: expenseCategoryId } });
      if (!expenseCategory) {
        throw new NotFoundException(`ExpenseCategory with ID ${expenseCategoryId} not found`);
      }
      expenseSubCategory.expenseCategory = expenseCategory;
    }

    Object.assign(expenseSubCategory, updateData);

    return this.expenseSubCategoryRepository.save(expenseSubCategory);
  }
  async remove(id: number): Promise<ExpenseSubCategory> {
    const expenseSubCategory = await this.findOne(id);
    await this.expenseSubCategoryRepository.remove(expenseSubCategory);
    return { ...expenseSubCategory, id };
  }
}
