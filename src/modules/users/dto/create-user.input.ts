import { InputType, Field, Int } from '@nestjs/graphql';
import { IsEmail, IsIn, IsNotEmpty, IsOptional } from 'class-validator';
import { UserRoles } from '../../roles/entities/role.entity';
import { IsUnique } from '../../common/decorators/unique.validator';
import { User } from '../entities/user.entity';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  @IsNotEmpty()
  name: string;

  @Field(() => String)
  @IsEmail()
  @IsUnique(User, {
    message: 'Email id is already in use.',
  })
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
