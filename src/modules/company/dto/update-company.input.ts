import { InputType, Field } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class UpdateCompanyInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @Field()
  @IsNumber()
  salaryDate?: number;

  @Field()
  @IsBoolean()
  isActive?: boolean;
}
