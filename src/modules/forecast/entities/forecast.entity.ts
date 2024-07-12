import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ExpenseCategory } from '../../expense-category/entities/expense-category.entity';
import { ExpenseSubCategory } from '../../expense-sub-category/entities/expense-sub-category.entity';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../company/entities/company.entity';

@ObjectType()
@Entity()
export class Forecast {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  @Field(() => Float)
  amount: number;

  @Column({ default: 'Default comment' })
  @Field()
  comment: string;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  payDate?: Date;

  @ManyToOne(() => ExpenseCategory, (expense) => expense.id)
  @JoinColumn({ name: 'expenseCategoryId' })
  @Field()
  expenseCategory: ExpenseCategory;

  @ManyToOne(() => ExpenseSubCategory, (expense) => expense.id)
  @JoinColumn({ name: 'expenseSubCategoryId' })
  @Field()
  expenseSubCategory: ExpenseSubCategory;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'createdBy' })
  @Field(() => User)
  createdBy: User;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'updatedBy' })
  @Field(() => User)
  updatedBy: User;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @JoinColumn({ name: 'staffId' })
  @Field(() => User, { nullable: true })
  staff?: User | null;

  @ManyToOne(() => Company, (company) => company.id)
  @JoinColumn({ name: 'companyId' })
  @Field(() => Company)
  company: Company;

  @Column({ type: 'int', nullable: true })
  relatedForecastId?: number | null;
}
