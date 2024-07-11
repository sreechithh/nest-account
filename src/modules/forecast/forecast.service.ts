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
    const forecasts: Forecast[] = [];
    const payDateObj = new Date(payDate);

    if (isGenerateForAllMonth) {
      let savedForecast: Forecast | null = null;
      const year: number = 2023;

      for (let i = 0; i < 12; i++) {
        const forecastDate = new Date(year, 3 + i, payDateObj.getDate());
        console.log(forecastDate);
        if (i === 0) {
          const forecast = this.forecastRepository.create({
            amount,
            comment,
            payDate: forecastDate,
            expenseCategory,
            expenseSubCategory,
            createdBy: user,
            updatedBy: user,
            staff: userEntity,
            company,
          });
          savedForecast = await this.forecastRepository.save(forecast);
          savedForecast.relatedForecastId = savedForecast.id;
          await this.forecastRepository.save(savedForecast);
        } else {
          const newEntity = this.forecastRepository.create({
            amount,
            comment,
            expenseCategory,
            expenseSubCategory,
            createdBy: user,
            updatedBy: user,
            payDate: forecastDate,
            staff: userEntity,
            company,
            relatedForecastId: savedForecast?.id,
          });
          await this.forecastRepository.save(newEntity);
        }
      }
    } else {
      const forecastDate = new Date(
        2024,
        payDateObj.getMonth(),
        payDateObj.getDate(),
      );
      forecasts.push(
        this.createForecastEntity({
          amount,
          comment,
          expenseCategory,
          expenseSubCategory,
          user,
          userEntity,
          payDate: forecastDate,
          company,
          relatedForecastId: null,
        }),
      );
    }

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
      isUpdateForAllMonth,
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

    const payDateObj = new Date(payDate);
    if (isUpdateForAllMonth && forecast?.relatedForecastId) {
      const forecasts = await this.forecastRepository.findBy({
        relatedForecastId: forecast.relatedForecastId,
      });

      for (const eachForecast of forecasts) {
        const forecastDate = new Date(
          2024,
          eachForecast.payDate?.getMonth() ?? 1,
          payDateObj.getDate(),
        );
        eachForecast.amount = amount;
        eachForecast.expenseCategory = expenseCategory;
        eachForecast.expenseSubCategory = expenseSubCategory;
        eachForecast.payDate = forecastDate;
        eachForecast.comment = comment;
        eachForecast.staff = userEntity;
        eachForecast.company = company;
        eachForecast.updatedBy = user;
      }

      return await this.forecastRepository.save(forecasts);
    } else {
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
    relatedForecastId: Forecast | null;
  }): any {
    const { isGenerateForAllMonth } = params;
    return isGenerateForAllMonth
      ? this.createMonthlyForecastForFinancialYear(params)
      : [this.createForecastEntity(params)];
  }

  private async createMonthlyForecastForFinancialYear(params: {
    amount: number;
    comment: string;
    expenseCategory: ExpenseCategory;
    expenseSubCategory: ExpenseSubCategory;
    user: User;
    userEntity: User | null;
    payDate: Date;
    company: Company;
  }): Promise<Forecast[]> {
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

    const payDateObj = new Date(payDate);
    const month = payDateObj.getMonth() + 1;

    let startYear: number;
    if (month >= 4) {
      startYear = 2024;
    } else {
      startYear = 2024 - 1;
    }
    const forecasts: Forecast[] = [];
    let savedForecast: Forecast | null = null;

    for (let i = 0; i < 12; i++) {
      const forecastDate = new Date(startYear, 3 + i, 1);
      if (i === 0) {
        const forecast = this.forecastRepository.create({
          amount,
          comment,
          payDate: forecastDate.toISOString().split('T')[0],
          expenseCategory,
          expenseSubCategory,
          createdBy: user,
          updatedBy: user,
          staff: userEntity,
          company,
        });
        savedForecast = await this.forecastRepository.save({ ...forecast });
        savedForecast.relatedForecastId = savedForecast.id;
        await this.forecastRepository.save(savedForecast);
      } else {
        forecasts.push(
          this.forecastRepository.create({
            amount,
            comment,
            payDate: forecastDate.toISOString().split('T')[0],
            expenseCategory,
            expenseSubCategory,
            createdBy: user,
            updatedBy: user,
            staff: userEntity,
            company,
            relatedForecastId: savedForecast?.id,
          }),
        );
      }
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
    payDate: Date | string;
    company: Company;
    relatedForecastId: Forecast | null;
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
      relatedForecastId,
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
      relatedForecastId: relatedForecastId?.id,
    });
  }
}
