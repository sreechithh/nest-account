import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
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
    const [expenseCategory] = await Promise.all([
      this.expenseCategoryRepository
        .findOneByOrFail({
          id: createExpenseSubCategoryInput.expenseCategoryId,
        })
        .catch(() => {
          throw new HttpException(
            `ExpenseCategory with ID ${createExpenseSubCategoryInput.expenseCategoryId} not found`,
            HttpStatus.NOT_FOUND,
          );
        }),
    ]);

    const expenseSubCategory = this.expenseSubCategoryRepository.create({
      name: createExpenseSubCategoryInput.name,
      expenseCategory: expenseCategory,
      isActive: createExpenseSubCategoryInput.isActive,
    });

    await this.expenseSubCategoryRepository.save(expenseSubCategory);

    return {
      statusCode: 201,
      message: 'Expense Sub Category created successfully',
      data: expenseSubCategory,
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
    return await this.expenseSubCategoryRepository
      .findOneOrFail({
        where: { id },
        relations: ['expenseCategory', 'expenses'],
      })
      .then((data) => {
        return {
          data,
          statusCode: 200,
          message: 'Expense Category fetched successfully',
        };
      })
      .catch(() => {
        throw new HttpException(
          `Expense category with ID ${id} was not found`,
          HttpStatus.NOT_FOUND,
        );
      });
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
    try {
      const expenseSubCategory =
        await this.expenseSubCategoryRepository.findOneByOrFail({ id });

      await this.expenseSubCategoryRepository.remove(expenseSubCategory);

      return {
        statusCode: 200,
        message: 'Expense Sub Category deleted successfully',
      };
    } catch (error) {
      if (error.name === 'EntityNotFound') {
        throw new NotFoundException(
          `Expense Sub Category with ID ${id} not found`,
        );
      }
      throw new HttpException(
        'Failed to delete expense sub-category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
