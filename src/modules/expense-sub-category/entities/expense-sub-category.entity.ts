import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ExpenseCategory } from '../../expense-category/entities/expense-category.entity';

@ObjectType()
@Entity()
export class ExpenseSubCategory {
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

  @Field(() => ExpenseCategory)
  @ManyToOne(() => ExpenseCategory, (category) => category.subCategories)
  expenseCategory: ExpenseCategory;
}
