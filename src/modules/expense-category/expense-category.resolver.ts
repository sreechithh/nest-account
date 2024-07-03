import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ExpenseCategoryService } from './expense-category.service';
import { ExpenseCategory } from './entities/expense-category.entity';
import { CreateExpenseCategoryInput } from './dto/create-expense-category.input';
import { UpdateExpenseCategoryInput } from './dto/update-expense-category.input';

@Resolver(() => ExpenseCategory)
export class ExpenseCategoryResolver {
  constructor(private readonly expenseCategoryService: ExpenseCategoryService) {}

  @Mutation(() => ExpenseCategory)
  createExpenseCategory(
    @Args('createExpenseCategoryInput') createExpenseCategoryInput: CreateExpenseCategoryInput,
  ): Promise<ExpenseCategory> {
    return this.expenseCategoryService.create(createExpenseCategoryInput);
  }

  @Query(() => [ExpenseCategory], { name: 'expenseCategories' })
  findAll(): Promise<ExpenseCategory[]> {
    return this.expenseCategoryService.findAll();
  }

  @Query(() => ExpenseCategory, { name: 'expenseCategory' })
  findOne(@Args('id', { type: () => Int }) id: number): Promise<ExpenseCategory> {
    return this.expenseCategoryService.findOne(id);
  }

  @Mutation(() => ExpenseCategory)
  updateExpenseCategory(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateExpenseCategoryInput') updateExpenseCategoryInput: UpdateExpenseCategoryInput,
  ): Promise<ExpenseCategory> {
    return this.expenseCategoryService.update(id, updateExpenseCategoryInput);
  }
  @Mutation(() => ExpenseCategory)
  removeExpenseCategory(@Args('id', { type: () => Int }) id: number): Promise<ExpenseCategory> {
    return this.expenseCategoryService.remove(id);
  }
}
