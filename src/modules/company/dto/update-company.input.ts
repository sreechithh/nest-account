import { InputType, Field } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UpdateCompanyInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @Field()
  @IsBoolean()
  isActive?: boolean;
}