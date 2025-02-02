import { InputType, Field, ID } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UpdateCompanyInput {
  @Field(() => ID)
  id: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsBoolean()
  isActive: boolean;
}
