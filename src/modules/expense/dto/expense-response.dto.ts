import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Expense } from '../entities/expense.entity';

@ObjectType()
@ObjectType()
export class CommonExpenseResponse {
  @Field(() => Int)
  statusCode: number;

  @Field()
  message: string;

  @Field(() => Expense, { nullable: true })
  data?: Expense;
}

@ObjectType()
export class PaginatedExpenseResponse {
  @Field(() => [Expense])
  data: Expense[];

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
