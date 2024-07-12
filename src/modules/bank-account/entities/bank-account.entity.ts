import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
  OneToMany,
} from 'typeorm';
import { Company } from 'src/modules/company/entities/company.entity';
import { BankTransaction } from '../../bank-transactions/entities/bank-transaction.entity';

@Unique(['accountNumber'])
@Entity()
@ObjectType()
export class BankAccount {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ unique: true })
  accountNumber: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column({ nullable: true })
  createdBy: number;

  @Field()
  @Column({ nullable: true })
  updatedBy: number;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field({ nullable: true })
  bankBalance?: number;

  @Field()
  @ManyToOne(() => Company)
  company: Company;

  @OneToMany(() => BankTransaction, (transaction) => transaction.bankAccount, {
    nullable: true,
  })
  @Field(() => [BankTransaction], { nullable: true })
  bankTransactions?: BankTransaction[];
}
