import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CompanyService } from './company.service';
import { Company } from './entities/company.entity';
import { CreateCompanyInput } from './dto/create-company.input';
import { UpdateCompanyInput } from './dto/update-company.input';
import { UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles';
import { UserRoles } from '../roles/entities/role.entity';

@Resolver(() => Company)
@UseGuards(AuthGuard, RolesGuard)
export class CompanyResolver {
  constructor(private readonly companyService: CompanyService) {}

  @Query(() => [Company])
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  async companies(
    @Args('pageSize', { type: () => Int, defaultValue: 10 }) pageSize: number,
    @Args('pageNumber', { type: () => Int, defaultValue: 1 })
    pageNumber: number,
  ): Promise<Company[]> {
    return this.companyService.findAll(pageSize, pageNumber);
  }

  @Query(() => Company)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  async company(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Company | null> {
    return this.companyService.findOne(id);
  }

  @Mutation(() => Company)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  async createCompany(
    @Args('createCompanyInput', ValidationPipe)
    createCompanyInput: CreateCompanyInput,
  ): Promise<Company> {
    return this.companyService.create(createCompanyInput);
  }

  @Mutation(() => Company)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  async updateCompany(
    @Args('updateCompanyInput', ValidationPipe)
    updateCompanyInput: UpdateCompanyInput,
  ): Promise<Company> {
    return this.companyService.update(updateCompanyInput);
  }

  @Mutation(() => Boolean)
  @Roles(UserRoles.ADMIN, UserRoles.ACCOUNTANT)
  async deleteCompany(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    await this.companyService.remove(id);
    return true;
  }
}
