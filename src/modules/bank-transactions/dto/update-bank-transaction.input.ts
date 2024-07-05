import { CreateBankTransactionInput } from './create-bank-transaction.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateBankTransactionInput extends PartialType(CreateBankTransactionInput) {
  @Field(() => Int)
  id: number;
}
