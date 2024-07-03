import { InputType, Field ,PartialType} from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateExpenseCategoryInput {

  @Field()
  @IsNotEmpty()
  name: string;


  @Field({nullable:true})
  isActive?: boolean;

}

@InputType()
export class UpdateExpenseCategoryInput extends PartialType(CreateExpenseCategoryInput) {}
