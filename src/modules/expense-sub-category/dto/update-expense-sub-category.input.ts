import { InputType, PartialType } from '@nestjs/graphql';
import { CreateExpenseSubCategoryInput } from './create-expense-sub-category.input';

@InputType()
export class UpdateExpenseSubCategoryInput extends PartialType(
  CreateExpenseSubCategoryInput,
) {}
