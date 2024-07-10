import { InputType, PartialType } from '@nestjs/graphql';
import { CreateExpenseInput } from './create-expense.input';

@InputType()
export class UpdateExpenseInput extends PartialType(CreateExpenseInput) {}
