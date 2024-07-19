import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@ObjectType()
export class CommonUsersResponse {
  @Field(() => Int)
  statusCode: number;

  @Field()
  message: string;

  @Field(() => User, { nullable: true })
  data?: User;
}
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

  @Field(() => Int)
  statusCode: number;

  @Field()
  message: string;
}
