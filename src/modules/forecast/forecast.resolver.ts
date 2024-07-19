import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ForecastService } from './forecast.service';
import { Forecast } from './entities/forecast.entity';
import { CreateForecastInput } from './dto/create-forecast.input';
import { UpdateForecastInput } from './dto/update-forecast.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles';
import { UserRoles } from '../roles/entities/role.entity';
import { CurrentUser } from '../auth/decorators/loggin.user';
import { User } from '../users/entities/user.entity';
import {
  PaginatedForecastResponse,
  CommonForecastResponse,
} from './dto/forecast-response.dto';

@UseGuards(AuthGuard, RolesGuard)
@Resolver(() => Forecast)
export class ForecastResolver {
  constructor(private readonly forecastService: ForecastService) {}

  @Mutation(() => CommonForecastResponse)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  createForecast(
    @CurrentUser() user: User,
    @Args('createForecastInput') createForecastInput: CreateForecastInput,
  ): Promise<CommonForecastResponse> {
    return this.forecastService.create(user, createForecastInput);
  }

  @Query(() => PaginatedForecastResponse, { name: 'forecasts' })
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  findAll(
    @Args('perPage', { type: () => Int, defaultValue: 10 }) perPage: number,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('companyId', { type: () => Int, defaultValue: null })
    companyId: number | null,
  ): Promise<PaginatedForecastResponse> {
    return this.forecastService.findAll(perPage, page, companyId);
  }

  @Query(() => CommonForecastResponse, { name: 'forecast' })
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  findOne(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<CommonForecastResponse> {
    return this.forecastService.findOne(id);
  }

  @Mutation(() => CommonForecastResponse)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  updateForecast(
    @CurrentUser() user: User,
    @Args('updateForecastInput') updateForecastInput: UpdateForecastInput,
  ): Promise<CommonForecastResponse> {
    return this.forecastService.update(user, updateForecastInput);
  }

  @Mutation(() => CommonForecastResponse)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  removeForecast(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<CommonForecastResponse> {
    return this.forecastService.remove(id);
  }

  @Query(() => Number)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  calculateForecast(
    @Args('month', { type: () => Int, nullable: true })
    month: number | null,
    @Args('companyId', { type: () => Int, nullable: true })
    companyId: number | null,
  ) {
    return this.forecastService.calculateForecast(month, companyId);
  }
}
