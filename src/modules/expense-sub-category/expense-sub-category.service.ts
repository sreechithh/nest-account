import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { ExpenseSubCategory } from './entities/expense-sub-category.entity';
import { ExpenseCategory } from '../expense-category/entities/expense-category.entity';
import { CreateExpenseSubCategoryInput } from './dto/create-expense-sub-category.input';
import { UpdateExpenseSubCategoryInput } from './dto/update-expense-sub-category.input';
import {
  CommonExpenseSubCategoryResponse,
  PaginatedExpenseSubCategoryResponse,
} from './dto/expense-sub-category-response.dto';

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
  ): Promise<CommonExpenseSubCategoryResponse> {
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

    await this.expenseSubCategoryRepository.save(expenseSubCategory);

    return {
      statusCode: 201,
      message: 'Expense Sub Category created successfully',
    };
  }

  async findAll(
    perPage: number,
    page: number,
  ): Promise<PaginatedExpenseSubCategoryResponse> {
    const options: FindManyOptions<ExpenseSubCategory> = {
      take: perPage,
      skip: (page - 1) * perPage,
      relations: ['expenseCategory'],
      order: { id: 'DESC' },
    };
    const [data, totalRows] =
      await this.expenseSubCategoryRepository.findAndCount(options);
    const totalPages = Math.ceil(totalRows / perPage);

    return {
      data,
      totalRows,
      totalPages,
      currentPage: page,
      statusCode: 200,
      message: 'Expenses Sub Category fetched successfully',
    };
  }

  async findOne(id: number): Promise<CommonExpenseSubCategoryResponse> {
    const data = await this.expenseSubCategoryRepository.findOne({
      where: { id },
      relations: ['expenseCategory', 'expenses'],
    });
    if (!data) {
      throw new NotFoundException(
        `Expense Subcategory with ID ${id} was not found`,
      );
    }
    return {
      data,
      statusCode: 200,
      message: 'Expense Sub category fetched successfully',
    };
  }

  async update(
    id: number,
    updateExpenseSubCategoryInput: UpdateExpenseSubCategoryInput,
  ): Promise<CommonExpenseSubCategoryResponse> {
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
    await this.expenseSubCategoryRepository.save(expenseSubCategory);
    return {
      statusCode: 200,
      message: 'Expense updated successfully',
    };
  }
  async remove(id: number): Promise<CommonExpenseSubCategoryResponse> {
    const expenseSubCategory =
      await this.expenseSubCategoryRepository.findOneBy({ id: id });
    if (!expenseSubCategory) {
      throw new NotFoundException(`Expense Category with ID ${id} not found`);
    }
    await this.expenseSubCategoryRepository.remove(expenseSubCategory);
    return {
      statusCode: 200,
      message: 'Expense deleted successfully',
    };
  }
}
