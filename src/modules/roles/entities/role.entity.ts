import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNotEmpty, Length } from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';

export const UserRoles = {
  ADMIN: 'admin',
  ACCOUNTANT: 'accountant',
  EMPLOYEE: 'employee',
};

@Entity()
@ObjectType()
export class Role {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  @IsNotEmpty()
  @Length(3, 20)
  name: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field(() => [User])
  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
