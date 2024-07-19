import { ObjectType, Field, Int } from '@nestjs/graphql';
import { BankTransaction } from '../entities/bank-transaction.entity';

@ObjectType()
export class CommonBankTransactionResponse {
  @Field(() => Int)
  statusCode: number;

  @Field()
  message: string;

  @Field(() => BankTransaction, { nullable: true })
  data?: BankTransaction;
}

@ObjectType()
export class PaginatedBankTransactionResponse {
  @Field(() => [BankTransaction])
  data: BankTransaction[];

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
