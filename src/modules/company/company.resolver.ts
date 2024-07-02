import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CompanyService } from './company.service';
import { Company } from './entities/company.entity';
import { CreateCompanyInput } from './dto/create-company.input';
import { UpdateCompanyInput } from './dto/update-company.input';
import { ValidationPipe } from '@nestjs/common';

@Resolver('Company')
export class CompanyResolver {
  constructor(private readonly companyService: CompanyService) {}

  @Query(() => [Company])
  async companies(
    @Args('pageSize', { type: () => Int, defaultValue: 10 }) pageSize: number,
    @Args('pageNumber', { type: () => Int, defaultValue: 1 }) pageNumber: number,
  ): Promise<Company[]> {
    return this.companyService.findAll(pageSize, pageNumber);
  }

  @Query(() => Company)
  async company(@Args('id') id: number): Promise<Company | null> {
    return this.companyService.findOne(id);
  }

  @Mutation(() => Company)
  async createCompany(@Args('createCompanyInput', ValidationPipe) createCompanyInput: CreateCompanyInput): Promise<Company> {
    return this.companyService.create(createCompanyInput);
  }

  @Mutation(() => Company)
  async updateCompany(
    @Args('id') id: number,
    @Args('updateCompanyInput', ValidationPipe) updateCompanyInput: UpdateCompanyInput,
  ): Promise<Company> {
    return this.companyService.update(id, updateCompanyInput);
  }

  @Mutation(() => Boolean)
  async deleteCompany(@Args('id') id: number): Promise<boolean> {
    await this.companyService.remove(id);
    return true;
  }
}