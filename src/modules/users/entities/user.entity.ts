import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { IsEmail, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { Role } from '../../roles/entities/role.entity';
import * as bcrypt from 'bcrypt';
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

  @Field()
  @Column()
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
  @Field(() => [BankTransaction], { nullable: true })
  transactions?: BankTransaction[];

  @Field(() => Staff, { nullable: true })
  @OneToOne(() => Staff, (staff) => staff.user, { nullable: true })
  staff: Staff;

  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
