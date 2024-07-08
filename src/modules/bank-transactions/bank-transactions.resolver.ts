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

@UseGuards(AuthGuard, RolesGuard)
@Resolver(() => BankTransaction)
export class BankTransactionsResolver {
  constructor(
    private readonly bankTransactionsService: BankTransactionsService,
  ) {}

  @Mutation(() => BankTransaction)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  createBankTransaction(
    @CurrentUser() user: User,
    @Args('createBankTransactionInput')
    createBankTransactionInput: CreateBankTransactionInput,
  ) {
    return this.bankTransactionsService.create(
      user,
      createBankTransactionInput,
    );
  }

  @Query(() => [BankTransaction], { name: 'bankTransactions' })
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  async findAll(
    @Args('pageSize', { type: () => Int, defaultValue: 10 }) pageSize: number,
    @Args('pageNumber', { type: () => Int, defaultValue: 1 })
    pageNumber: number,
  ): Promise<BankTransaction[]> {
    return this.bankTransactionsService.findAll(pageSize, pageNumber);
  }

  @Query(() => BankTransaction, { name: 'bankTransaction' })
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.bankTransactionsService.findOne(id);
  }

  @Mutation(() => String)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  removeBankTransaction(@Args('id', { type: () => Int }) id: number) {
    return this.bankTransactionsService.remove(id);
  }
}
