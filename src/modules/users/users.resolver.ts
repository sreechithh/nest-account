import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UseFilters, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/loggin.user';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles';
import { UserRoles } from '../roles/entities/role.entity';
import { CustomGraphQLValidationExceptionFilter } from '../common/validation/custom-validation-exception.filter';
import {
  CommonUsersResponse,
  PaginatedUsersResponse,
} from './dto/users-response.dto';

@UseFilters(new CustomGraphQLValidationExceptionFilter())
@Resolver(() => User)
@UseGuards(AuthGuard, RolesGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => CommonUsersResponse)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  createUser(
    @CurrentUser() user: User,
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<CommonUsersResponse> {
    return this.usersService.create(user, createUserInput);
  }

  @Query(() => PaginatedUsersResponse, { name: 'users' })
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  findAll(
    @Args('perPage', { type: () => Int, defaultValue: 10 }) perPage: number,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('isActive', {
      type: () => Boolean,
      nullable: true,
      defaultValue: false,
    })
    isActive: boolean | null,
    @Args('role', {
      type: () => String,
      nullable: true,
      defaultValue: null,
    })
    role: string | null,
  ): Promise<PaginatedUsersResponse> {
    return this.usersService.findAll(perPage, page, isActive, role);
  }

  @Query(() => CommonUsersResponse, { name: 'user' })
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  findOne(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<CommonUsersResponse> {
    return this.usersService.findOne({ where: { id }, relations: ['roles'] });
  }

  @Mutation(() => CommonUsersResponse)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  updateUser(
    @CurrentUser() user: User,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<CommonUsersResponse> {
    return this.usersService.update(user, updateUserInput);
  }
}
