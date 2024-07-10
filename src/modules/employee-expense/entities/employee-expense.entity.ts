import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Expense } from '../../expense/entities/expense.entity';
import { IsNotEmpty, IsNumber } from 'class-validator';

@ObjectType()
@Entity()
export class EmployeeExpense {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.employeeExpenses)
  @JoinColumn({ name: 'employeeId' })
  @IsNotEmpty()
  @IsNumber()
  user: User;

  @Field(() => Expense)
  @OneToOne(() => Expense, (expense) => expense.employeeExpense)
  @JoinColumn({ name: 'expenseId' })
  @IsNotEmpty()
  @IsNumber()
  expense: Expense;
}
