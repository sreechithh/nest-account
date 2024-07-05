import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { BankTransactionsService } from './bank-transactions.service';
import { BankTransaction } from './entities/bank-transaction.entity';
import { CreateBankTransactionInput } from './dto/create-bank-transaction.input';
import { UpdateBankTransactionInput } from './dto/update-bank-transaction.input';

@Resolver(() => BankTransaction)
export class BankTransactionsResolver {
  constructor(private readonly bankTransactionsService: BankTransactionsService) {}

  @Mutation(() => BankTransaction)
  createBankTransaction(@Args('createBankTransactionInput') createBankTransactionInput: CreateBankTransactionInput) {
    return this.bankTransactionsService.create(createBankTransactionInput);
  }

  @Query(() => [BankTransaction], { name: 'bankTransactions' })
  findAll() {
    return this.bankTransactionsService.findAll();
  }

  @Query(() => BankTransaction, { name: 'bankTransaction' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.bankTransactionsService.findOne(id);
  }

  @Mutation(() => BankTransaction)
  updateBankTransaction(@Args('updateBankTransactionInput') updateBankTransactionInput: UpdateBankTransactionInput) {
    return this.bankTransactionsService.update(updateBankTransactionInput.id, updateBankTransactionInput);
  }

  @Mutation(() => BankTransaction)
  removeBankTransaction(@Args('id', { type: () => Int }) id: number) {
    return this.bankTransactionsService.remove(id);
  }
}
