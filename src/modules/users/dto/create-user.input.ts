import { InputType, Field, Int } from '@nestjs/graphql';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';
import { UserRoles } from '../../roles/entities/role.entity';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String)
  password: string;

  @Field(() => String)
  @IsIn([UserRoles.ACCOUNTANT, UserRoles.EMPLOYEE], {
    message: `Role must be either ${UserRoles.ACCOUNTANT} or ${UserRoles.EMPLOYEE}`,
  })
  role: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  companyId?: number | null;
}
