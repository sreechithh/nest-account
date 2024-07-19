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
import {
  CommonCompanyResponse,
  PaginatedCompanyResponse,
} from './dto/company-response.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async findAll(
    perPage: number,
    page: number,
  ): Promise<PaginatedCompanyResponse> {
    const options: FindManyOptions<Company> = {
      take: perPage,
      skip: (page - 1) * perPage,
      order: { id: 'DESC' },
    };
    const [data, totalRows] =
      await this.companyRepository.findAndCount(options);
    const totalPages = Math.ceil(totalRows / perPage);

    return {
      data,
      totalRows,
      totalPages,
      currentPage: page,
      statusCode: 200,
      message: 'Companies fetched successfully',
    };
  }

  async findOne(id: number): Promise<CommonCompanyResponse> {
    const data = await this.companyRepository.findOneBy({ id });
    if (!data) {
      throw new NotFoundException();
    }
    return {
      data,
      statusCode: 200,
      message: 'Company fetched successfully',
    };
  }

  async create(
    createCompanyInput: CreateCompanyInput,
  ): Promise<CommonCompanyResponse> {
    const newCompany = this.companyRepository.create({
      ...createCompanyInput,
    });
    await this.companyRepository.save(newCompany);
    return {
      statusCode: 200,
      message: 'Company created successfully',
    };
  }

  async update(
    updateCompanyInput: UpdateCompanyInput,
  ): Promise<CommonCompanyResponse> {
    const { id } = updateCompanyInput;
    const existingCompany = await this.companyRepository.findOneBy({ id });

    if (!existingCompany) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    existingCompany.name = updateCompanyInput.name;
    existingCompany.isActive = updateCompanyInput.isActive;

    await this.companyRepository.save(existingCompany);

    return {
      statusCode: 200,
      message: 'Company updated successfully',
    };
  }

  async remove(id: number): Promise<CommonCompanyResponse> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['bankAccounts'],
    });

    if (
      !company ||
      (company?.bankAccounts && company.bankAccounts.length > 0)
    ) {
      throw new ConflictException(
        `Company with ID ${id} has bank accounts and cannot be deleted`,
      );
    }
    await this.companyRepository.remove(company);

    return {
      statusCode: 200,
      message: 'Company deleted successfully',
    };
  }
}
