import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { IsEmail, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { Role } from '../../roles/entities/role.entity';
import * as bcrypt from 'bcrypt';
import { EmployeeExpense } from '../../employee-expense/entities/employee-expense.entity';
import { BankTransaction } from '../../bank-transactions/entities/bank-transaction.entity';

@Unique(['email'])
@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  @IsNotEmpty()
  @Length(3, 20)
  name: string;

  @Field()
  @Column()
  @IsEmail()
  email: string;

  @Field()
  @Column()
  @IsOptional()
  password: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column({ nullable: true })
  createdBy: string;

  @Field()
  @Column({ nullable: true })
  updatedBy: string;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field(() => [Role])
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles: Role[];

  @OneToMany(() => BankTransaction, (transaction) => transaction.createdByUser)
  @Field(() => [BankTransaction])
  transactions?: BankTransaction[];

  @Field(() => [EmployeeExpense])
  @OneToMany(() => EmployeeExpense, (employeeExpense) => employeeExpense.user)
  employeeExpenses: EmployeeExpense[];

  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return await bcrypt.compare(attempt, this.password);
  }
}
