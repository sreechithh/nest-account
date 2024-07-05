import { InputType, PartialType } from '@nestjs/graphql';
import { CreateExpenseCategoryInput } from './create-expense-category.input';

@InputType()
export class UpdateExpenseCategoryInput extends PartialType(CreateExpenseCategoryInput) {}
