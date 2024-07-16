import { CreateEmployeeExpenseInput } from './create-employee-expense.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateEmployeeExpenseInput extends PartialType(CreateEmployeeExpenseInput) {
  @Field(() => Int)
  id: number;
}
