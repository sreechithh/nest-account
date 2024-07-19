import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { ExpenseService } from './expense.service';
import { Expense } from './entities/expense.entity';
import { CreateExpenseInput } from './dto/create-expense.input';
import { UpdateExpenseInput } from './dto/update-expense.input';
import { CurrentUser } from '../auth/decorators/loggin.user';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles';
import { UserRoles } from '../roles/entities/role.entity';
import {
  CommonExpenseResponse,
  PaginatedExpenseResponse,
} from './dto/expense-response.dto';

@ObjectType()
@Resolver(() => Expense)
@UseGuards(AuthGuard, RolesGuard)
export class ExpenseResolver {
  constructor(private readonly expenseService: ExpenseService) {}

  @Mutation(() => CommonExpenseResponse)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  async createExpense(
    @Args('createExpenseInput') createExpenseInput: CreateExpenseInput,
    @CurrentUser() user: any,
  ): Promise<CommonExpenseResponse> {
    return this.expenseService.create(createExpenseInput, user.id);
  }

  @Query(() => PaginatedExpenseResponse, { name: 'expenses' })
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  async findAllExpenses(
    @Args('perPage', { type: () => Int, defaultValue: 10 }) perPage: number,
    @Args('page', { type: () => Int }) page: number,
  ): Promise<PaginatedExpenseResponse> {
    return this.expenseService.findAll(perPage, page);
  }

  @Query(() => CommonExpenseResponse, { name: 'expense' })
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  findOne(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<CommonExpenseResponse> {
    return this.expenseService.findOne(id);
  }

  @Mutation(() => CommonExpenseResponse)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  updateExpense(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateExpenseInput') updateExpenseInput: UpdateExpenseInput,
    @CurrentUser() user: any,
  ): Promise<CommonExpenseResponse> {
    return this.expenseService.update(id, { ...updateExpenseInput }, user.id);
  }

  @Mutation(() => CommonExpenseResponse)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  async removeExpense(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<CommonExpenseResponse> {
    return this.expenseService.remove(id);
  }

  @Mutation(() => CommonExpenseResponse)
  @Roles(UserRoles.ADMIN)
  async approveExpenses(
    @Args({ name: 'ids', type: () => [Int] }) ids: number[],
  ): Promise<CommonExpenseResponse> {
    return this.expenseService.approveExpenses(ids);
  }

  @Mutation(() => CommonExpenseResponse)
  @Roles(UserRoles.ADMIN)
  async rejectExpenses(
    @Args({ name: 'ids', type: () => [Int] }) ids: number[],
  ): Promise<CommonExpenseResponse> {
    return this.expenseService.rejectExpenses(ids);
  }

  @Mutation(() => CommonExpenseResponse)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  async paidExpenses(
    @Args({ name: 'ids', type: () => [Int] }) ids: number[],
    @CurrentUser() user: any,
  ): Promise<CommonExpenseResponse> {
    return this.expenseService.paidExpenses(ids, user.id);
  }
  @Query(() => Number)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  calculateExpense(
    @Args('month', { type: () => Int, nullable: true })
    month: number | null,
    @Args('year', { type: () => Int, nullable: true })
    year: number | null,
    @Args('startDate', { type: () => String, nullable: true })
    startDate: string | null,
    @Args('endDate', { type: () => String, nullable: true })
    endDate: string | null,
    @Args('companyId', { type: () => Int, nullable: true })
    companyId: number | null,
  ) {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    return this.expenseService.calculateExpense(
      month,
      year,
      start,
      end,
      companyId,
    );
  }
}
