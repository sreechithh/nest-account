import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Forecast } from '../entities/forecast.entity';

@ObjectType()
export class CommonForecastResponse {
  @Field(() => Int)
  statusCode: number;

  @Field()
  message: string;

  @Field(() => Forecast, { nullable: true })
  data?: Forecast;
}

@ObjectType()
export class PaginatedForecastResponse {
  @Field(() => [Forecast])
  data: Forecast[];

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
