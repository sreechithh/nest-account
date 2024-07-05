import { InputType, PartialType, Field, Int } from '@nestjs/graphql';
import { CreateExpenseSubCategoryInput } from './create-expense-sub-category.input';

@InputType()
export class UpdateExpenseSubCategoryInput extends PartialType(CreateExpenseSubCategoryInput) {
  @Field(() => Int)
  id: number;
}
