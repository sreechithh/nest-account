import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateExpenseCategoryInput {

  @Field()
  @IsNotEmpty()
  name: string;


  @Field({ defaultValue: true, nullable: true })
  isActive?: boolean;

}
