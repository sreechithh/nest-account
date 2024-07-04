import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyInput } from './dto/create-company.input';
import { UpdateCompanyInput } from './dto/update-company.input';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  findAll(
    pageSize: number = 10,
    pageNumber: number = 1,
    searchQuery?: string,
  ): Promise<Company[]> {
    const options: FindManyOptions<Company> = {
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
    };
    return this.companyRepository.find(options);
  }

  findOne(id: number): Promise<Company | null> {
    return this.companyRepository.findOneBy({ id });
  }

  create(createCompanyInput: CreateCompanyInput): Promise<Company> {
    const newCompany = this.companyRepository.create({
      ...createCompanyInput,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return this.companyRepository.save(newCompany);
  }

  async update(
    id: number,
    updateCompanyInput: UpdateCompanyInput,
  ): Promise<Company> {
    const existingCompany = await this.companyRepository.findOneBy({ id });

    if (!existingCompany) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    const updatedCompany = this.companyRepository.merge(existingCompany, {
      ...updateCompanyInput,
      updatedAt: new Date(),
    });

    return await this.companyRepository.save(updatedCompany);
  }

  async remove(id: number): Promise<boolean> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['bankAccounts'],
    });

    if (company?.bankAccounts && company.bankAccounts.length > 0) {
      throw new ConflictException(
        `Company with ID ${id} has bank accounts and cannot be deleted`,
      );
    }
    ///
    return await this.companyRepository.delete(id);
  }
}
