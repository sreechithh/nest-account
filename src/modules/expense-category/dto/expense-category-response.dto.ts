import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ExpenseCategory } from '../entities/expense-category.entity';

@ObjectType()
export class CommonExpenseCategoryResponse {
  @Field(() => Int)
  statusCode: number;

  @Field()
  message: string;

  @Field(() => ExpenseCategory, { nullable: true })
  data?: ExpenseCategory;
}

@ObjectType()
export class PaginatedExpenseCategoryResponse {
  @Field(() => [ExpenseCategory])
  data: ExpenseCategory[];

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
