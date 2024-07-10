import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseSubCategory } from './entities/expense-sub-category.entity';
import { ExpenseCategory } from '../expense-category/entities/expense-category.entity';
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

  async create(
    createExpenseSubCategoryInput: CreateExpenseSubCategoryInput,
  ): Promise<ExpenseSubCategory> {
    const expenseCategory = await this.expenseCategoryRepository.findOneBy({
      id: createExpenseSubCategoryInput.expenseCategoryId,
    });
    if (!expenseCategory) {
      throw new NotFoundException(
        `ExpenseCategory with ID ${createExpenseSubCategoryInput.expenseCategoryId} not found`,
      );
    }

    const expenseSubCategory = this.expenseSubCategoryRepository.create({
      name: createExpenseSubCategoryInput.name,
      expenseCategory: expenseCategory,
      isActive: createExpenseSubCategoryInput.isActive,
    });

    return this.expenseSubCategoryRepository.save(expenseSubCategory);
  }

  findAll(): Promise<ExpenseSubCategory[]> {
    return this.expenseSubCategoryRepository.find({
      relations: ['expenseCategory', 'expenses'],
    });
  }

  async findOne(id: number): Promise<ExpenseSubCategory> {
    return await this.expenseSubCategoryRepository.findOneOrFail({
      where: { id },
      relations: ['expenseCategory', 'expenses'],
    });
  }

  async update(
    id: number,
    updateExpenseSubCategoryInput: UpdateExpenseSubCategoryInput,
  ): Promise<ExpenseSubCategory> {
    const { expenseCategoryId, ...updateData } = updateExpenseSubCategoryInput;

    const expenseSubCategory =
      await this.expenseSubCategoryRepository.findOneOrFail({ where: { id } });

    if (expenseCategoryId) {
      const expenseCategory =
        await this.expenseCategoryRepository.findOneOrFail({
          where: { id: expenseCategoryId },
        });
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
