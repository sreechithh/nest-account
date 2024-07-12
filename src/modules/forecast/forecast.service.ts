import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Raw, Repository } from 'typeorm';
import { Forecast } from './entities/forecast.entity';
import { User } from '../users/entities/user.entity';
import { ExpenseSubCategory } from '../expense-sub-category/entities/expense-sub-category.entity';
import { ExpenseCategory } from '../expense-category/entities/expense-category.entity';
import { CreateForecastInput } from './dto/create-forecast.input';
import { UpdateForecastInput } from './dto/update-forecast.input';
import { Company } from '../company/entities/company.entity';
const defaultForecastYear: number = 2023;

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
    const payDateObj = new Date(payDate);
    const forecasts: Forecast[] = [];

    if (isGenerateForAllMonth) {
      const savedForecast = await this.generateForecastsForYear(
        user,
        amount,
        comment,
        expenseCategory,
        expenseSubCategory,
        company,
        userEntity,
        payDateObj,
      );
      forecasts.push(...savedForecast);
    } else {
      const forecastDate = new Date(
        payDateObj.getMonth() < 3
          ? defaultForecastYear + 1
          : defaultForecastYear,
        payDateObj.getMonth(),
        payDateObj.getDate(),
      );
      const forecast = this.createForecastEntity({
        amount,
        comment,
        expenseCategory,
        expenseSubCategory,
        user,
        userEntity,
        payDate: forecastDate,
        company,
        relatedForecastId: null,
      });
      forecasts.push(forecast);
    }

    return this.forecastRepository.save(forecasts);
  }

  private async generateForecastsForYear(
    user: User,
    amount: number,
    comment: string,
    expenseCategory: ExpenseCategory,
    expenseSubCategory: ExpenseSubCategory,
    company: Company,
    userEntity: User | null,
    payDateObj: Date,
  ): Promise<Forecast[]> {
    const forecasts: Forecast[] = [];
    let savedForecast: Forecast | null = null;

    for (let i = 0; i < 12; i++) {
      const forecastDate = new Date(
        defaultForecastYear,
        3 + i,
        payDateObj.getDate(),
      );

      const forecast = this.createForecastEntity({
        amount,
        comment,
        expenseCategory,
        expenseSubCategory,
        user,
        userEntity,
        payDate: forecastDate,
        company,
        relatedForecastId: savedForecast ? savedForecast.id : null,
      });

      const savedEntity = await this.forecastRepository.save(forecast);

      if (i === 0) {
        savedForecast = savedEntity;
        savedForecast.relatedForecastId = savedForecast.id;
        await this.forecastRepository.save(savedForecast);
      }

      forecasts.push(savedEntity);
    }

    return forecasts;
  }

  private createForecastEntity({
    amount,
    comment,
    expenseCategory,
    expenseSubCategory,
    user,
    userEntity,
    payDate,
    company,
    relatedForecastId,
  }: {
    amount: number;
    comment: string;
    expenseCategory: ExpenseCategory;
    expenseSubCategory: ExpenseSubCategory;
    user: User;
    userEntity: User | null;
    payDate: Date;
    company: Company;
    relatedForecastId: number | null;
  }): Forecast {
    return this.forecastRepository.create({
      amount,
      comment,
      payDate,
      expenseCategory,
      expenseSubCategory,
      createdBy: user,
      updatedBy: user,
      staff: userEntity,
      company,
      relatedForecastId: relatedForecastId,
    });
  }

  findAll(
    perPage: number,
    page: number,
    companyId?: number | null,
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
      where: {},
    };

    if (companyId) {
      options.where = { ...options.where, company: { id: companyId } };
    }
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

    const forecasts =
      forecast.relatedForecastId && isUpdateForAllMonth
        ? await this.forecastRepository.find({
            where: { relatedForecastId: forecast.relatedForecastId },
            relations: ['createdBy'],
          })
        : [forecast];

    const payDateObj = new Date(payDate);

    forecasts.forEach((eachForecast) => {
      eachForecast.amount = amount;
      eachForecast.expenseCategory = expenseCategory;
      eachForecast.expenseSubCategory = expenseSubCategory;
      eachForecast.payDate = new Date(
        eachForecast.payDate?.getFullYear() ?? defaultForecastYear,
        eachForecast.payDate?.getMonth() ?? 1,
        payDateObj.getDate(),
      );
      eachForecast.comment = comment;
      eachForecast.staff = userEntity;
      eachForecast.company = company;
      eachForecast.updatedBy = user;
    });

    return this.forecastRepository.save(forecasts);
  }

  async remove(id: number) {
    const forecast = await this.forecastRepository.findOneByOrFail({ id });

    if (forecast.relatedForecastId) {
      await this.forecastRepository.delete({
        relatedForecastId: forecast.relatedForecastId,
      });

      return `ID with #${id} has been removed from forecast with all related forecasts`;
    }
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

  async calculateForecast(
    month: number | null = null,
    companyId: number | null = null,
  ): Promise<number> {
    const conditions: any = {};

    if (month !== null) {
      conditions.payDate = Raw(
        (alias) => `EXTRACT(MONTH FROM ${alias}) = :month`,
        { month },
      );
    }
    if (companyId !== null) {
      conditions.company = { id: companyId };
    }
    const sum = await this.forecastRepository.sum('amount', conditions);

    return sum || 0;
  }
}
