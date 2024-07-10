import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Field, ObjectType, Int, Float } from '@nestjs/graphql';
import { ExpenseCategory } from '../../expense-category/entities/expense-category.entity';
import { ExpenseSubCategory } from '../../expense-sub-category/entities/expense-sub-category.entity';
import { IsNotEmpty } from 'class-validator';
import { ExpenseStatus } from '../enums/expense-status.enum';
import { EmployeeExpense } from '../../employee-expense/entities/employee-expense.entity';
import { BankTransaction } from '../../bank-transactions/entities/bank-transaction.entity';
import { GraphQLDate } from 'graphql-scalars';
import { Company } from '../../company/entities/company.entity';

@ObjectType()
@Entity()
export class Expense {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: true })
  @Column({ type: 'timestamp with time zone', nullable: true })
  adminResponse?: Date;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  comments?: string;

  @Field(() => ExpenseStatus)
  @Column({ type: 'enum', enum: ExpenseStatus, default: ExpenseStatus.PENDING })
  status: ExpenseStatus;

  @Field()
  @Column()
  @IsNotEmpty()
  expenseCategoryId: number;

  @Field()
  @Column()
  @IsNotEmpty()
  expenseSubCategoryId: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  bankTransactionId?: number;

  @Field()
  @Column()
  companyId: number;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true, type: 'timestamp with time zone' })
  paidAt?: Date | null;

  @Field(() => GraphQLDate, { nullable: true })
  @Column({ type: 'date', nullable: true })
  paidDate?: Date | null;

  @Field({ nullable: true })
  @Column({ default: false })
  isPaymentRequest?: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Int)
  @Column()
  @IsNotEmpty()
  createdBy: number;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  updatedBy?: number;

  @Field(() => ExpenseCategory)
  @ManyToOne(
    () => ExpenseCategory,
    (expenseCategory) => expenseCategory.expenses,
  )
  @JoinColumn({ name: 'expenseCategoryId' })
  expenseCategory: ExpenseCategory;

  @Field(() => ExpenseSubCategory)
  @ManyToOne(() => ExpenseSubCategory)
  @JoinColumn({ name: 'expenseSubCategoryId' })
  expenseSubCategory: ExpenseSubCategory;

  @Field(() => EmployeeExpense, { nullable: true })
  @OneToOne(() => EmployeeExpense, (employeeExpense) => employeeExpense.expense)
  employeeExpense: EmployeeExpense;

  @Field(() => BankTransaction, { nullable: true })
  @OneToOne(() => BankTransaction, (bankTransaction) => bankTransaction.expense)
  @JoinColumn({ name: 'bankTransactionId' })
  bankTransaction: BankTransaction;

  @Field(() => Company, { nullable: true })
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;
}
