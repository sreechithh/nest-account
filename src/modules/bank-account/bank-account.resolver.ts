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

@Resolver(() => BankAccount)
@UseGuards(AuthGuard, RolesGuard)
export class BankAccountResolver {
  constructor(private readonly bankAccountService: BankAccountService) {}

  @Mutation(() => BankAccount)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  createBankAccount(
    @CurrentUser() user: User,
    @Args('createBankAccountInput')
    createBankAccountInput: CreateBankAccountInput,
  ): Promise<BankAccount> {
    return this.bankAccountService.create(user, createBankAccountInput);
  }

  @Query(() => [BankAccount], { name: 'bankAccounts' })
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  findAll() {
    return this.bankAccountService.findAll();
  }

  @Query(() => BankAccount, { name: 'bankAccount' })
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.bankAccountService.findOne(id);
  }

  @Mutation(() => BankAccount)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  updateBankAccount(
    @CurrentUser() user: User,
    @Args('updateBankAccountInput')
    updateBankAccountInput: UpdateBankAccountInput,
  ) {
    return this.bankAccountService.update(user, updateBankAccountInput);
  }

  @Mutation(() => Boolean)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  async removeBankAccount(@Args('id', { type: () => Int }) id: number) {
    await this.bankAccountService.remove(id);
    return true;
  }
}
