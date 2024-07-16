import { ObjectType, Field, ID, HideField } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Length } from 'class-validator';
import { Role } from '../../roles/entities/role.entity';
import * as bcrypt from 'bcrypt';
import { EmployeeExpense } from '../../employee-expense/entities/employee-expense.entity';
import { BankTransaction } from '../../bank-transactions/entities/bank-transaction.entity';
import { Staff } from '../../staff/entities/staff.entity';

@Unique(['email'])
@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  @Length(3, 20)
  name: string;

  @Field()
  @Column()
  email: string;

  @Column()
  @HideField()
  password: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  @Field(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  createdBy?: User | null;

  @ManyToOne(() => User, (user) => user.id)
  @Field(() => User, { nullable: true })
  @JoinColumn({ name: 'updatedBy' })
  updatedBy?: User | null;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field(() => [Role])
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles: Role[];

  @OneToMany(() => BankTransaction, (transaction) => transaction.createdByUser)
  @Field(() => [BankTransaction], { nullable: true })
  transactions?: BankTransaction[] | null;

  @Field(() => Staff, { nullable: true })
  @OneToOne(() => Staff, (staff) => staff.user, { nullable: true })
  staff?: Staff | null;

  @Field(() => [EmployeeExpense])
  @OneToMany(() => EmployeeExpense, (employeeExpense) => employeeExpense.user)
  employeeExpenses: EmployeeExpense[];

  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
