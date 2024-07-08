import { InputType, Field, Int } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';
import { IsUnique } from '../../common/decorators/unique.validator';
import { BankAccount } from '../entities/bank-account.entity';

@InputType()
export class UpdateBankAccountInput {
  @Field(() => Int)
  id: number;

  @Field()
  @IsNotEmpty()
  @IsNumber()
  companyId: number;

  @Field()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsNotEmpty()
  @IsUnique(BankAccount, {
    message: 'Account Number is already in use.',
  })
  accountNumber: string;

  @Field()
  @IsBoolean()
  isActive: boolean;
}
