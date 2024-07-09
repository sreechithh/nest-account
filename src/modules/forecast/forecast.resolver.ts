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

@UseGuards(AuthGuard, RolesGuard)
@Resolver(() => Forecast)
export class ForecastResolver {
  constructor(private readonly forecastService: ForecastService) {}

  @Mutation(() => [Forecast])
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  createForecast(
    @CurrentUser() user: User,
    @Args('createForecastInput') createForecastInput: CreateForecastInput,
  ) {
    return this.forecastService.create(user, createForecastInput);
  }

  @Query(() => [Forecast], { name: 'forecast' })
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  findAll() {
    return this.forecastService.findAll();
  }

  @Query(() => Forecast, { name: 'forecast' })
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.forecastService.findOne(id);
  }

  @Mutation(() => Forecast)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  updateForecast(
    @CurrentUser() user: User,
    @Args('updateForecastInput') updateForecastInput: UpdateForecastInput,
  ) {
    return this.forecastService.update(user, updateForecastInput);
  }

  @Mutation(() => Forecast)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  removeForecast(@Args('id', { type: () => Int }) id: number) {
    return this.forecastService.remove(id);
  }
}
