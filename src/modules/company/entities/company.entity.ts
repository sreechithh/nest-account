import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BankAccount } from '../../bank-account/entities/bank-account.entity';

@Entity()
@ObjectType()
export class Company {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  @Field(() => Int)
  id: number;

  @Column({ length: 100 })
  @Field()
  name: string;

  @Column({ default: true })
  @Field()
  isActive: boolean;

  @Column()
  @Field()
  salaryDate: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @Field(() => [BankAccount])
  @OneToMany(() => BankAccount, (bankAccounts) => bankAccounts.company)
  bankAccounts?: BankAccount[];
}
