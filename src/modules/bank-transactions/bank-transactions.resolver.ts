import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { BankTransactionsService } from './bank-transactions.service';
import { BankTransaction } from './entities/bank-transaction.entity';
import { CreateBankTransactionInput } from './dto/create-bank-transaction.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles';
import { UserRoles } from '../roles/entities/role.entity';
import { CurrentUser } from '../auth/decorators/loggin.user';
import { User } from '../users/entities/user.entity';
import {
  CommonBankTransactionResponse,
  PaginatedBankTransactionResponse,
} from './dto/bank-transaction-response.dto';

@UseGuards(AuthGuard, RolesGuard)
@Resolver(() => BankTransaction)
export class BankTransactionsResolver {
  constructor(
    private readonly bankTransactionsService: BankTransactionsService,
  ) {}

  @Mutation(() => CommonBankTransactionResponse)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  createBankTransaction(
    @CurrentUser() user: User,
    @Args('createBankTransactionInput')
    createBankTransactionInput: CreateBankTransactionInput,
  ): Promise<CommonBankTransactionResponse> {
    return this.bankTransactionsService.create(
      user,
      createBankTransactionInput,
    );
  }

  @Query(() => PaginatedBankTransactionResponse, { name: 'bankTransactions' })
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  async findAll(
    @Args('perPage', { type: () => Int }) perPage: number,
    @Args('page', { type: () => Int }) page: number,
  ): Promise<PaginatedBankTransactionResponse> {
    return this.bankTransactionsService.findAll(perPage, page);
  }

  @Query(() => CommonBankTransactionResponse, { name: 'bankTransaction' })
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  findOne(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<CommonBankTransactionResponse> {
    return this.bankTransactionsService.findOne(id);
  }

  @Mutation(() => CommonBankTransactionResponse)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  removeBankTransaction(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<CommonBankTransactionResponse> {
    return this.bankTransactionsService.remove(id);
  }
}
