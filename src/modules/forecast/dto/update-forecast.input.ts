import { CreateForecastInput } from './create-forecast.input';
import { InputType, Field, Int, PartialType, Float } from '@nestjs/graphql';
import { IsDate, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

@InputType()
export class UpdateForecastInput extends PartialType(CreateForecastInput) {
  @Field(() => Int)
  id: number;

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
  @IsNumber()
  staffId?: number;

  @Field(() => Int)
  @IsNumber()
  companyId: number;
}
