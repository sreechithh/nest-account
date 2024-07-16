import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@ObjectType()
export class PaginatedUsersResponse {
  @Field(() => [User])
  data: User[];

  @Field(() => Int)
  totalRows: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  currentPage: number;
}
