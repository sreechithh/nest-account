import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ExpenseSubCategory } from '../entities/expense-sub-category.entity';

@ObjectType()
export class CommonExpenseSubCategoryResponse {
  @Field(() => Int)
  statusCode: number;

  @Field()
  message: string;

  @Field(() => ExpenseSubCategory, { nullable: true })
  data?: ExpenseSubCategory;
}

@ObjectType()
export class PaginatedExpenseSubCategoryResponse {
  @Field(() => [ExpenseSubCategory])
  data: ExpenseSubCategory[];

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
