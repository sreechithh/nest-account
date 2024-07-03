import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ExpenseSubCategory } from '../../expense-sub-category/entities/expense-sub-category.entity';

@ObjectType()
@Entity()
export class ExpenseCategory {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field({defaultValue:true})
  @Column()
  isActive: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ExpenseSubCategory, subCategory => subCategory.expenseCategory, { eager: true })
  subCategories: ExpenseSubCategory[];
}
