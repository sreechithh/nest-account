import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ExpenseSubCategory } from '../../expense-sub-category/entities/expense-sub-category.entity';
import { Expense } from '../../expense/entities/expense.entity';

@ObjectType()
@Entity()
export class ExpenseCategory {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

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

  @Field(() => [ExpenseSubCategory], { nullable: true })
  @OneToMany(
    () => ExpenseSubCategory,
    (subCategory) => subCategory.expenseCategory,
  )
  subCategories: ExpenseSubCategory[];

  @Field(() => [Expense], { nullable: true })
  @OneToMany(() => Expense, (expense) => expense.expenseCategory)
  expenses: Expense[];
}
