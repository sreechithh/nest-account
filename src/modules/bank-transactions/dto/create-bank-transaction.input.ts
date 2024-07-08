import { InputType, Int, Field } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { TransactionType } from '../entities/bank-transaction.entity';

@InputType()
export class CreateBankTransactionInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  bankId: number;

  @Field()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @Field()
  @IsEnum(TransactionType)
  type: string;

  @Field()
  @IsNotEmpty()
  comment: string;
}
