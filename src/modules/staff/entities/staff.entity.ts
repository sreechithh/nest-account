import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../company/entities/company.entity';

@ObjectType()
@Entity()
export class Staff {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Field(() => Int)
  @OneToOne(() => User, (user: User) => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => Company)
  @ManyToOne(() => Company, (company: Company) => company.staff)
  @JoinColumn({ name: 'companyId' })
  company: undefined | Company;
}
