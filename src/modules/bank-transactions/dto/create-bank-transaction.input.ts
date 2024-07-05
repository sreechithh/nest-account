import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateBankTransactionInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
