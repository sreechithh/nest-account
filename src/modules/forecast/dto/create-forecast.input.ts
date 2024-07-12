import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsDate, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

@InputType()
export class CreateForecastInput {
  @Field(() => Float)
  @IsNotEmpty()
  amount: number;

  @Field(() => String)
  @IsNotEmpty()
  comment: string;

  @Field()
  @IsDate()
  payDate: Date;

  @Field()
  @IsNumber()
  expenseCategoryId: number;

  @Field()
  @IsNumber()
  expenseSubCategoryId: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  staffId?: number;

  @Field(() => Int)
  @IsNumber()
  companyId: number;

  @Field(() => Boolean, { nullable: true })
  isGenerateForAllMonth?: boolean;
}
