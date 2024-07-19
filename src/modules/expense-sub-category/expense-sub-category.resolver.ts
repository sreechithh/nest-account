import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ExpenseSubCategoryService } from './expense-sub-category.service';
import { ExpenseSubCategory } from './entities/expense-sub-category.entity';
import { CreateExpenseSubCategoryInput } from './dto/create-expense-sub-category.input';
import { UpdateExpenseSubCategoryInput } from './dto/update-expense-sub-category.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles';
import { UserRoles } from '../roles/entities/role.entity';
import {
  CommonExpenseSubCategoryResponse,
  PaginatedExpenseSubCategoryResponse,
} from './dto/expense-sub-category-response.dto';

@Resolver(() => ExpenseSubCategory)
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
export class ExpenseSubCategoryResolver {
  constructor(private expenseSubCategoryService: ExpenseSubCategoryService) {}

  @Mutation(() => CommonExpenseSubCategoryResponse)
  createExpenseSubCategory(
    @Args('createExpenseSubCategoryInput')
    createExpenseSubCategoryInput: CreateExpenseSubCategoryInput,
  ): Promise<CommonExpenseSubCategoryResponse> {
    return this.expenseSubCategoryService.create(createExpenseSubCategoryInput);
  }

  @Query(() => PaginatedExpenseSubCategoryResponse, {
    name: 'expenseSubCategories',
  })
  findAll(
    @Args('perPage', { type: () => Int }) perPage: number,
    @Args('page', { type: () => Int }) page: number,
  ): Promise<PaginatedExpenseSubCategoryResponse> {
    return this.expenseSubCategoryService.findAll(perPage, page);
  }

  @Query(() => CommonExpenseSubCategoryResponse, { name: 'expenseSubCategory' })
  findOne(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<CommonExpenseSubCategoryResponse> {
    return this.expenseSubCategoryService.findOne(id);
  }

  @Mutation(() => CommonExpenseSubCategoryResponse)
  updateExpenseSubCategory(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateExpenseSubCategoryInput')
    updateExpenseSubCategoryInput: UpdateExpenseSubCategoryInput,
  ): Promise<CommonExpenseSubCategoryResponse> {
    return this.expenseSubCategoryService.update(
      id,
      updateExpenseSubCategoryInput,
    );
  }
  @Mutation(() => CommonExpenseSubCategoryResponse)
  removeExpenseSubCategory(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<CommonExpenseSubCategoryResponse> {
    return this.expenseSubCategoryService.remove(id);
  }
}
