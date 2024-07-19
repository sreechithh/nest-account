import { ObjectType, Field, Int } from '@nestjs/graphql';
import { BankAccount } from '../entities/bank-account.entity';

@ObjectType()
export class CommonBankAccountResponse {
  @Field(() => Int)
  statusCode: number;

  @Field()
  message: string;

  @Field(() => BankAccount, { nullable: true })
  data?: BankAccount;
}

@ObjectType()
export class PaginatedBankAccountResponse {
  @Field(() => [BankAccount])
  data: BankAccount[];

  @Field(() => Int)
  totalRows: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  statusCode: number;

  @Field()
  message: string;
}
