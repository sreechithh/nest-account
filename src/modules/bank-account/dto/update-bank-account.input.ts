import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateBankAccountInput } from './create-bank-account.input';

@InputType()
export class UpdateBankAccountInput extends PartialType(CreateBankAccountInput) {
  @Field(() => Int)
  id: number;
}