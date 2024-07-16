import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { GraphQLDate } from 'graphql-scalars';
import { IsNotEmpty, IsNumber, IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class CreateExpenseInput {
  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @Field({ nullable: true })
  comments?: string;

  @Field({ defaultValue: false })
  @IsBoolean()
  isPaymentRequest: boolean;

  @Field(() => GraphQLDate, { nullable: true })
  @IsOptional()
  paidDate?: Date | null;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  expenseCategoryId: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  expenseSubCategoryId: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  employeeId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  bankId?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  companyId?: number;
}
