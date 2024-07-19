import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ExpenseCategory } from '../../expense-category/entities/expense-category.entity';
import { Expense } from '../../expense/entities/expense.entity';
import { IsNotEmpty } from 'class-validator';

@ObjectType()
@Entity()
export class ExpenseSubCategory {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  @IsNotEmpty()
  expenseCategoryId: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => ExpenseCategory)
  @ManyToOne(() => ExpenseCategory, (category) => category.subCategories)
  @JoinColumn({ name: 'expenseCategoryId' })
  expenseCategory: ExpenseCategory;

  @Field(() => [Expense], { nullable: true })
  @OneToMany(() => Expense, (expense) => expense.expenseSubCategory)
  expenses: Expense[];
}
