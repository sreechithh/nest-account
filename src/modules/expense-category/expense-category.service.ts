import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { ExpenseCategory } from './entities/expense-category.entity';
import { CreateExpenseCategoryInput } from './dto/create-expense-category.input';
import { UpdateExpenseCategoryInput } from './dto/update-expense-category.input';
import {
  CommonExpenseCategoryResponse,
  PaginatedExpenseCategoryResponse,
} from './dto/expense-category-response.dto';

@Injectable()
export class ExpenseCategoryService {
  constructor(
    @InjectRepository(ExpenseCategory)
    private expenseCategoryRepository: Repository<ExpenseCategory>,
  ) {}

  async create(
    createExpenseCategoryInput: CreateExpenseCategoryInput,
  ): Promise<CommonExpenseCategoryResponse> {
    const expenseCategory = this.expenseCategoryRepository.create({
      ...createExpenseCategoryInput,
      isActive: createExpenseCategoryInput.isActive,
    });
    await this.expenseCategoryRepository.save(expenseCategory);

    return {
      statusCode: 201,
      message: 'Expense Category created successfully',
    };
  }

  async findAll(
    perPage: number,
    page: number,
  ): Promise<PaginatedExpenseCategoryResponse> {
    const options: FindManyOptions<ExpenseCategory> = {
      take: perPage,
      skip: (page - 1) * perPage,
      relations: ['subCategories'],
      order: { id: 'DESC' },
    };

    const [data, totalRows] =
      await this.expenseCategoryRepository.findAndCount(options);
    const totalPages = Math.ceil(totalRows / perPage);

    return {
      data,
      totalRows,
      totalPages,
      currentPage: page,
      statusCode: 200,
      message: 'Expense Categories fetched successfully',
    };
  }

  async findOne(id: number): Promise<CommonExpenseCategoryResponse> {
    return await this.expenseCategoryRepository
      .findOneOrFail({
        where: { id },
        relations: ['subCategories'],
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
    updateExpenseCategoryInput: UpdateExpenseCategoryInput,
  ): Promise<CommonExpenseCategoryResponse> {
    const expenseCategory = await this.expenseCategoryRepository.preload({
      id,
      ...updateExpenseCategoryInput,
    });

    if (!expenseCategory) {
      throw new NotFoundException(`ExpenseCategory with ID ${id} not found`);
    }
    await this.expenseCategoryRepository.save(expenseCategory);

    return {
      statusCode: 200,
      message: 'Expense Category updated successfully',
    };
  }

  async remove(id: number): Promise<CommonExpenseCategoryResponse> {
    return await this.expenseCategoryRepository
      .findOne({
        where: { id },
      })
      .then(async (expenseCategory) => {
        if (!expenseCategory) {
          throw new HttpException(
            `Expense Category with ID ${id} was not found`,
            HttpStatus.NOT_FOUND,
          );
        }

        if (expenseCategory.name === 'Staff') {
          throw new HttpException(
            `ExpenseCategory with Name Staff cannot be deleted`,
            HttpStatus.BAD_REQUEST,
          );
        }

        if (
          expenseCategory.subCategories &&
          expenseCategory.subCategories.length > 0
        ) {
          throw new HttpException(
            `ExpenseCategory with ID ${id} has subcategories and cannot be deleted`,
            HttpStatus.CONFLICT,
          );
        }

        await this.expenseCategoryRepository.remove(expenseCategory);

        return {
          statusCode: 200,
          message: 'Expense Category deleted successfully',
        };
      })
      .catch((error) => {
        if (error instanceof HttpException) {
          throw error;
        }
        throw new HttpException(
          'An error occurred while deleting the expense category',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
  }
}
