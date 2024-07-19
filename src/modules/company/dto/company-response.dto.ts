import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Company } from '../entities/company.entity';

@ObjectType()
export class CommonCompanyResponse {
  @Field(() => Int)
  statusCode: number;

  @Field()
  message: string;

  @Field(() => Company, { nullable: true })
  data?: Company;
}

@ObjectType()
export class PaginatedCompanyResponse {
  @Field(() => [Company])
  data: Company[];

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
