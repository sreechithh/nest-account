import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { ExpenseCategoryService } from './expense-category.service';
import { CreateExpenseCategoryInput } from './dto/create-expense-category.input';
import { UpdateExpenseCategoryInput } from './dto/update-expense-category.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles';
import { UserRoles } from '../roles/entities/role.entity';
import { ExpenseCategory } from './entities/expense-category.entity';
import {
  CommonExpenseCategoryResponse,
  PaginatedExpenseCategoryResponse,
} from './dto/expense-category-response.dto';

@ObjectType()
@Resolver(() => ExpenseCategory)
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
export class ExpenseCategoryResolver {
  constructor(
    private readonly expenseCategoryService: ExpenseCategoryService,
  ) {}

  @Mutation(() => CommonExpenseCategoryResponse)
  createExpenseCategory(
    @Args('createExpenseCategoryInput')
    createExpenseCategoryInput: CreateExpenseCategoryInput,
  ): Promise<CommonExpenseCategoryResponse> {
    return this.expenseCategoryService.create(createExpenseCategoryInput);
  }

  @Query(() => PaginatedExpenseCategoryResponse, { name: 'expenseCategories' })
  findAll(
    @Args('perPage', { type: () => Int }) perPage: number,
    @Args('page', { type: () => Int }) page: number,
  ): Promise<PaginatedExpenseCategoryResponse> {
    return this.expenseCategoryService.findAll(perPage, page);
  }

  @Query(() => CommonExpenseCategoryResponse, { name: 'expenseCategory' })
  findOne(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<CommonExpenseCategoryResponse> {
    return this.expenseCategoryService.findOne(id);
  }

  @Mutation(() => CommonExpenseCategoryResponse)
  updateExpenseCategory(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateExpenseCategoryInput')
    updateExpenseCategoryInput: UpdateExpenseCategoryInput,
  ): Promise<CommonExpenseCategoryResponse> {
    return this.expenseCategoryService.update(id, updateExpenseCategoryInput);
  }

  @Mutation(() => CommonExpenseCategoryResponse)
  removeExpenseCategory(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<CommonExpenseCategoryResponse> {
    return this.expenseCategoryService.remove(id);
  }
}
