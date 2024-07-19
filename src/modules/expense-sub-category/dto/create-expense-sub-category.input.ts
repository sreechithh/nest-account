import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateExpenseSubCategoryInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field(() => Int)
  @IsNotEmpty()
  expenseCategoryId: number;

  @Field({ defaultValue: true, nullable: true })
  isActive?: boolean;
}
