import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';

@Entity()
@ObjectType()
export class BankAccount {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  company_id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  account_number: string;

  @Field()
  @CreateDateColumn()
  created_at: Date;

  @Field()
  @UpdateDateColumn()
  updated_at: Date;

  @Field()
  @Column({ nullable: true })
  createdBy: number;

  @Field()
  @Column({ nullable: true })
  updatedBy: number;

  @Field()
  @Column({ default: true })
  isActive: boolean;
}