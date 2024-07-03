import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateBankAccountInput {
  @Field(() => Int)
  companyId: number;

  @Field()
  name: string;

  @Field()
  accountNumber: string;

  @Field()
  bankBalance: number;
}
