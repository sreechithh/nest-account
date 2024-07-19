import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { BankAccountService } from './bank-account.service';
import { BankAccount } from './entities/bank-account.entity';
import { CreateBankAccountInput } from './dto/create-bank-account.input';
import { UpdateBankAccountInput } from './dto/update-bank-account.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles';
import { UserRoles } from '../roles/entities/role.entity';
import { CurrentUser } from '../auth/decorators/loggin.user';
import { User } from '../users/entities/user.entity';
import {
  CommonBankAccountResponse,
  PaginatedBankAccountResponse,
} from './dto/bank-account-response.dto';

@Resolver(() => BankAccount)
@UseGuards(AuthGuard, RolesGuard)
export class BankAccountResolver {
  constructor(private readonly bankAccountService: BankAccountService) {}

  @Mutation(() => CommonBankAccountResponse)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  createBankAccount(
    @CurrentUser() user: User,
    @Args('createBankAccountInput')
    createBankAccountInput: CreateBankAccountInput,
  ): Promise<CommonBankAccountResponse> {
    return this.bankAccountService.create(user, createBankAccountInput);
  }

  @Query(() => PaginatedBankAccountResponse, { name: 'bankAccounts' })
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  findAll(
    @Args('perPage', { type: () => Int }) perPage: number,
    @Args('page', { type: () => Int }) page: number,
  ): Promise<PaginatedBankAccountResponse> {
    return this.bankAccountService.findAll(perPage, page);
  }

  @Query(() => CommonBankAccountResponse, { name: 'bankAccount' })
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  findOne(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<CommonBankAccountResponse> {
    return this.bankAccountService.findOne(id);
  }

  @Mutation(() => CommonBankAccountResponse)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  updateBankAccount(
    @CurrentUser() user: User,
    @Args('updateBankAccountInput')
    updateBankAccountInput: UpdateBankAccountInput,
  ): Promise<CommonBankAccountResponse> {
    const hi = this.bankAccountService.update(user, updateBankAccountInput);

    return hi;
  }

  @Mutation(() => CommonBankAccountResponse)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  async removeBankAccount(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<CommonBankAccountResponse> {
    return await this.bankAccountService.remove(id);
  }
}
