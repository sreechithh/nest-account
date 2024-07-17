import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Forecast } from '../entities/forecast.entity';

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
}
