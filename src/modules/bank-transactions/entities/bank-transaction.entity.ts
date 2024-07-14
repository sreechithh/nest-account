import {
  ObjectType,
  Field,
  Int,
  Float,
  registerEnumType,
} from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BankAccount } from '../../bank-account/entities/bank-account.entity';
import { Expense } from '../../expense/entities/expense.entity';
import { IsNotEmpty, IsNumber } from 'class-validator';

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

// Register the enum with GraphQL
registerEnumType(TransactionType, {
  name: 'TransactionType',
});

@ObjectType()
@Entity()
export class BankTransaction {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  bankId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  @Field(() => Float)
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  @Field(() => TransactionType)
  type: string;

  @Column()
  @Field(() => String)
  comment: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @Column()
  @Field(() => Int)
  createdBy: number;

  @Field(() => Int, { nullable: true })
  bankBalance?: number | null;

  @Field(() => BankAccount)
  @ManyToOne(() => BankAccount, (bankAccount) => bankAccount.bankTransactions)
  @JoinColumn({ name: 'bankId' })
  bankAccount: BankAccount;

  @ManyToOne(() => User)
  @Field(() => User)
  @JoinColumn({ name: 'createdBy' })
  createdByUser: User;

  @Field(() => Expense, { nullable: true })
  @OneToOne(() => Expense, (expense) => expense.bankTransaction)
  expense: Expense;
}
