import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Company } from 'src/modules/company/entities/company.entity';

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
  accountNumber: string;

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

  @Field()
  @ManyToOne(() => Company)
  company: Company;
}
