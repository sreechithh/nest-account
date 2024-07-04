import { Injectable, NotFoundException , ConflictException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseCategory } from './entities/expense-category.entity';
import { CreateExpenseCategoryInput } from './dto/create-expense-category.input';
import { UpdateExpenseCategoryInput } from './dto/update-expense-category.input';

@Injectable()
export class ExpenseCategoryService {
  constructor(
    @InjectRepository(ExpenseCategory)
    private expenseCategoryRepository: Repository<ExpenseCategory>,
  ) {}

  create(createExpenseCategoryInput: CreateExpenseCategoryInput): Promise<ExpenseCategory> {
    const expenseCategory = this.expenseCategoryRepository.create({
      ...createExpenseCategoryInput,
      isActive: createExpenseCategoryInput.isActive
    });
    return this.expenseCategoryRepository.save(expenseCategory);
  }

  findAll(): Promise<ExpenseCategory[]> {
    return this.expenseCategoryRepository.find({ relations: ['subCategories'] });
  }

  async findOne(id: number): Promise<ExpenseCategory> {
   return await this.expenseCategoryRepository.findOneOrFail({where: { id } });

  }

  async update(id: number, updateExpenseCategoryInput: UpdateExpenseCategoryInput): Promise<ExpenseCategory> {
    const expenseCategory = await this.expenseCategoryRepository.preload({
      id,
      ...updateExpenseCategoryInput,
    });
    if (!expenseCategory) {
      throw new NotFoundException(`ExpenseCategory with ID ${id} not found`);
    }
    return this.expenseCategoryRepository.save(expenseCategory);
  }
  async remove(id: number): Promise<ExpenseCategory> {
    const expenseCategory = await this.findOne(id);
    if (expenseCategory.subCategories && expenseCategory.subCategories.length > 0) {
      throw new ConflictException(`ExpenseCategory with ID ${id} has subcategories and cannot be deleted`);
    }
    await this.expenseCategoryRepository.remove(expenseCategory);

    return { ...expenseCategory, id };
  }

}
