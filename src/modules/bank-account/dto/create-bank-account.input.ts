import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateBankAccountInput {
  @Field(() => Int)
  company_id: number;

  @Field()
  name: string;

  @Field()
  account_number: string;

  @Field()
  createdBy: string;

  @Field()
  updatedBy: string;

  @Field()
  isActive: boolean;
}