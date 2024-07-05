import { InputType, Field, ID } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class UpdateCompanyInput {
  @Field(() => ID)
  id: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsNumber()
  salaryDate: number;

  @Field()
  @IsBoolean()
  isActive: boolean;
}
