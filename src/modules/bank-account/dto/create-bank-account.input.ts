import { InputType, Field, Int } from '@nestjs/graphql';
import { IsUnique } from '../../common/decorators/unique.validator';
import { BankAccount } from '../entities/bank-account.entity';
import { IsNotEmpty, IsNumber } from 'class-validator';

@InputType()
export class CreateBankAccountInput {
  @Field(() => Int)
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
  @IsNotEmpty()
  @IsNumber()
  bankBalance: number;
}
