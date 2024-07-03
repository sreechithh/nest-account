import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ExpenseSubCategoryService } from './expense-sub-category.service';
import { ExpenseSubCategory } from './entities/expense-sub-category.entity';
import { CreateExpenseSubCategoryInput } from './dto/create-expense-sub-category.input';
import { UpdateExpenseSubCategoryInput } from './dto/update-expense-sub-category.input';

@Resolver(() => ExpenseSubCategory)
export class ExpenseSubCategoryResolver {
  constructor(private expenseSubCategoryService: ExpenseSubCategoryService) {}

  @Mutation(() => ExpenseSubCategory)
  createExpenseSubCategory(
    @Args('createExpenseSubCategoryInput') createExpenseSubCategoryInput: CreateExpenseSubCategoryInput,
  ): Promise<ExpenseSubCategory> {
    return this.expenseSubCategoryService.create(createExpenseSubCategoryInput);
  }

  @Query(() => [ExpenseSubCategory], { name: 'expenseSubCategories' })
  findAll(): Promise<ExpenseSubCategory[]> {
    return this.expenseSubCategoryService.findAll();
  }

  @Query(() => ExpenseSubCategory, { name: 'expenseSubCategory' })
  findOne(@Args('id', { type: () => Int }) id: number): Promise<ExpenseSubCategory> {
    return this.expenseSubCategoryService.findOne(id);
  }

  @Mutation(() => ExpenseSubCategory)
  updateExpenseSubCategory(
    @Args('updateExpenseSubCategoryInput') updateExpenseSubCategoryInput: UpdateExpenseSubCategoryInput,
  ): Promise<ExpenseSubCategory> {
    return this.expenseSubCategoryService.update(updateExpenseSubCategoryInput);
  }
  @Mutation(() => ExpenseSubCategory)
  removeExpenseSubCategory(@Args('id', { type: () => Int }) id: number): Promise<ExpenseSubCategory> {
    return this.expenseSubCategoryService.remove(id);
  }
}
