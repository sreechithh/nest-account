import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Forecast } from './entities/forecast.entity';
import { User } from '../users/entities/user.entity';
import { ExpenseSubCategory } from '../expense-sub-category/entities/expense-sub-category.entity';
import { ExpenseCategory } from '../expense-category/entities/expense-category.entity';
import { CreateForecastInput } from './dto/create-forecast.input';
import { UpdateForecastInput } from './dto/update-forecast.input';
import { Company } from '../company/entities/company.entity';

@Injectable()
export class ForecastService {
  constructor(
    @InjectRepository(Forecast)
    private readonly forecastRepository: Repository<Forecast>,
    @InjectRepository(ExpenseCategory)
    private readonly expenseCategoryRepository: Repository<ExpenseCategory>,
    @InjectRepository(ExpenseSubCategory)
    private readonly expenseSubCategoryRepository: Repository<ExpenseSubCategory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(
    user: User,
    createForecastInput: CreateForecastInput,
  ): Promise<Forecast[]> {
    const {
      amount,
      comment,
      expenseSubCategoryId,
      payDate,
      expenseCategoryId,
      companyId,
      isGenerateForAllMonth,
      staffId,
    } = createForecastInput;

    const [expenseCategory, expenseSubCategory, company, userEntity] =
      await this.checkExpenseCategoryAndStaffExists(
        expenseCategoryId,
        expenseSubCategoryId,
        companyId,
        staffId,
      );

    const forecasts = this.generateForecasts({
      amount,
      comment,
      expenseCategory,
      expenseSubCategory,
      user,
      userEntity,
      payDate,
      company,
      isGenerateForAllMonth,
    });

    return this.forecastRepository.save(forecasts);
  }

  findAll(
    perPage: number,
    page: number,
    searchQuery?: string,
  ): Promise<Forecast[]> {
    const options: FindManyOptions<Forecast> = {
      take: perPage,
      skip: (page - 1) * perPage,
      relations: [
        'expenseCategory',
        'expenseSubCategory',
        'createdBy',
        'updatedBy',
        'company',
      ],
    };
    return this.forecastRepository.find(options);
  }

  findOne(id: number): Promise<Forecast> {
    return this.forecastRepository.findOneOrFail({
      where: { id },
      relations: [
        'expenseCategory',
        'expenseSubCategory',
        'createdBy',
        'updatedBy',
        'company',
      ],
    });
  }

  async update(user: User, updateForecastInput: UpdateForecastInput) {
    const {
      id,
      amount,
      expenseCategoryId,
      expenseSubCategoryId,
      payDate,
      comment,
      companyId,
      staffId,
    } = updateForecastInput;
    const [expenseCategory, expenseSubCategory, company, userEntity] =
      await this.checkExpenseCategoryAndStaffExists(
        expenseCategoryId,
        expenseSubCategoryId,
        companyId,
        staffId,
      );
    const forecast = await this.forecastRepository.findOneOrFail({
      where: { id },
      relations: ['createdBy'],
    });
    forecast.amount = amount;
    forecast.expenseCategory = expenseCategory;
    forecast.expenseSubCategory = expenseSubCategory;
    forecast.payDate = payDate;
    forecast.comment = comment;
    forecast.staff = userEntity;
    forecast.company = company;
    forecast.updatedBy = user;

    return await this.forecastRepository.save(forecast);
  }

  async remove(id: number) {
    const forecast = await this.forecastRepository.findOneByOrFail({ id });
    await this.forecastRepository.remove(forecast);

    return `ID with #${id} has been removed from forecast`;
  }

  private async checkExpenseCategoryAndStaffExists(
    expenseCategoryId: number,
    expenseSubCategoryId: number,
    companyId: number,
    staffId: number | undefined,
  ) {
    return await Promise.all([
      this.expenseCategoryRepository.findOneByOrFail({
        id: expenseCategoryId,
      }),
      this.expenseSubCategoryRepository.findOneByOrFail({
        id: expenseSubCategoryId,
      }),
      this.companyRepository.findOneByOrFail({
        id: companyId,
      }),
      staffId
        ? this.userRepository.findOneByOrFail({ id: staffId })
        : Promise.resolve(null),
    ]);
  }

  private generateForecasts(params: {
    amount: number;
    comment: string;
    expenseCategory: ExpenseCategory;
    expenseSubCategory: ExpenseSubCategory;
    user: User;
    userEntity: User | null;
    payDate: Date;
    company: Company;
    isGenerateForAllMonth: boolean | undefined;
  }): Forecast[] {
    const { isGenerateForAllMonth } = params;

    return isGenerateForAllMonth
      ? this.createMonthlyForecasts(params)
      : [this.createForecastEntity(params)];
  }

  private createMonthlyForecasts(params: {
    amount: number;
    comment: string;
    expenseCategory: ExpenseCategory;
    expenseSubCategory: ExpenseSubCategory;
    user: User;
    userEntity: User | null;
    payDate: Date;
    company: Company;
  }): Forecast[] {
    const {
      amount,
      comment,
      expenseCategory,
      expenseSubCategory,
      user,
      userEntity,
      payDate,
      company,
    } = params;
    const year = payDate.getFullYear();
    const forecasts: Forecast[] = [];

    for (let month = 0; month < 12; month++) {
      const monthlyPayDate = new Date(year, month, payDate.getDate());
      forecasts.push(
        this.createForecastEntity({
          amount,
          comment,
          expenseCategory,
          expenseSubCategory,
          user,
          userEntity,
          payDate: monthlyPayDate,
          company,
        }),
      );
    }

    return forecasts;
  }

  private createForecastEntity(params: {
    amount: number;
    comment: string;
    expenseCategory: ExpenseCategory;
    expenseSubCategory: ExpenseSubCategory;
    user: User;
    userEntity: User | null;
    payDate: Date;
    company: Company;
  }): Forecast {
    const {
      amount,
      comment,
      expenseCategory,
      expenseSubCategory,
      user,
      userEntity,
      payDate,
      company,
    } = params;

    return this.forecastRepository.create({
      amount,
      comment,
      expenseCategory,
      expenseSubCategory,
      createdBy: user,
      updatedBy: user,
      payDate,
      staff: userEntity,
      company,
    });
  }
}
