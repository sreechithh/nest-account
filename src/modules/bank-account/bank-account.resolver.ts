import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { BankAccountService } from './bank-account.service';
import { BankAccount } from './entities/bank-account.entity';
import { CreateBankAccountInput } from './dto/create-bank-account.input';
import { UpdateBankAccountInput } from './dto/update-bank-account.input';

@Resolver(() => BankAccount)
export class BankAccountResolver {
  constructor(private readonly bankAccountService: BankAccountService) {}

  @Mutation(() => BankAccount)
  createBankAccount(@Args('createBankAccountInput') createBankAccountInput: CreateBankAccountInput) {
    return this.bankAccountService.create(createBankAccountInput);
  }

  @Query(() => [BankAccount], { name: 'bankAccounts' })
  findAll() {
    return this.bankAccountService.findAll();
  }

  @Query(() => BankAccount, { name: 'bankAccount' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.bankAccountService.findOne(id);
  }

  @Mutation(() => BankAccount)
  updateBankAccount(@Args('updateBankAccountInput') updateBankAccountInput: UpdateBankAccountInput) {
    return this.bankAccountService.update(updateBankAccountInput.id, updateBankAccountInput);
  }

  @Mutation(() => Boolean)
  async removeBankAccount(@Args('id', { type: () => Int }) id: number) {
    await this.bankAccountService.remove(id);
    return true;
  }
}