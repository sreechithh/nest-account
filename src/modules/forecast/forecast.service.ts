import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Raw, Repository } from 'typeorm';
import { Forecast } from './entities/forecast.entity';
import { User } from '../users/entities/user.entity';
import { ExpenseSubCategory } from '../expense-sub-category/entities/expense-sub-category.entity';
import { ExpenseCategory } from '../expense-category/entities/expense-category.entity';
import { CreateForecastInput } from './dto/create-forecast.input';
import { UpdateForecastInput } from './dto/update-forecast.input';
import { Company } from '../company/entities/company.entity';
import {
  CommonForecastResponse,
  PaginatedForecastResponse,
} from './dto/forecast-response.dto';
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
  ): Promise<CommonForecastResponse> {
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
        Date.UTC(
          payDateObj.getMonth() < 3
            ? defaultForecastYear + 1
            : defaultForecastYear,
          payDateObj.getMonth(),
          payDateObj.getDate(),
        ),
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

    await this.forecastRepository.save(forecasts);

    return {
      statusCode: 201,
      message: 'Forecast created successfully',
    };
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
        Date.UTC(defaultForecastYear, 3 + i, payDateObj.getDate(), 0, 0, 0, 0),
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

  async findAll(
    perPage: number,
    page: number,
    companyId?: number | null,
  ): Promise<PaginatedForecastResponse> {
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
    const [data, totalRows] =
      await this.forecastRepository.findAndCount(options);
    const totalPages = Math.ceil(totalRows / perPage);

    return {
      data,
      totalRows,
      totalPages,
      currentPage: page,
      statusCode: 200,
      message: 'Forecasts fetched successfully',
    };
  }

  async findOne(id: number): Promise<CommonForecastResponse> {
    const data = await this.forecastRepository.findOneOrFail({
      where: { id },
      relations: [
        'expenseCategory',
        'expenseSubCategory',
        'createdBy',
        'updatedBy',
        'company',
      ],
    });

    return {
      data,
      statusCode: 200,
      message: 'Forecast fetched successfully',
    };
  }

  async update(
    user: User,
    updateForecastInput: UpdateForecastInput,
  ): Promise<CommonForecastResponse> {
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

    await this.forecastRepository.save(forecasts);

    return {
      statusCode: 200,
      message: 'Forecast updated successfully',
    };
  }

  async remove(id: number): Promise<CommonForecastResponse> {
    const forecast = await this.forecastRepository.findOneByOrFail({ id });

    if (forecast.relatedForecastId) {
      await this.forecastRepository.delete({
        relatedForecastId: forecast.relatedForecastId,
      });

      return {
        statusCode: 200,
        message: `ID with #${id} has been removed from forecast with all related forecasts`,
      };
      // return `ID with #${id} has been removed from forecast with all related forecasts`;
    }
    await this.forecastRepository.remove(forecast);

    return {
      statusCode: 200,
      message: `ID with #${id} has been removed from forecast`,
    };
  }

  private async checkExpenseCategoryAndStaffExists(
    expenseCategoryId: number,
    expenseSubCategoryId: number,
    companyId: number,
    staffId: number | undefined,
  ) {
    return await Promise.all([
      this.expenseCategoryRepository
        .findOneByOrFail({
          id: expenseCategoryId,
        })
        .catch(() => {
          throw new HttpException(
            `Expense category with ID ${expenseCategoryId} was not found`,
            HttpStatus.NOT_FOUND,
          );
        }),
      this.expenseSubCategoryRepository
        .findOneByOrFail({
          id: expenseSubCategoryId,
        })
        .catch(() => {
          throw new HttpException(
            `Expense sub-category with ID ${expenseSubCategoryId} was not found`,
            HttpStatus.NOT_FOUND,
          );
        }),
      this.companyRepository
        .findOneByOrFail({
          id: companyId,
        })
        .catch(() => {
          throw new HttpException(
            `Company with ID ${companyId} was not found`,
            HttpStatus.NOT_FOUND,
          );
        }),
      staffId
        ? this.userRepository.findOneByOrFail({ id: staffId }).catch(() => {
            throw new HttpException(
              `Staff with ID ${staffId} was not found`,
              HttpStatus.NOT_FOUND,
            );
          })
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
