import { Module } from '@nestjs/common';
import { ForecastService } from './forecast.service';
import { ForecastResolver } from './forecast.resolver';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Forecast } from './entities/forecast.entity';
import { ExpenseCategory } from '../expense-category/entities/expense-category.entity';
import { ExpenseSubCategory } from '../expense-sub-category/entities/expense-sub-category.entity';
import { User } from '../users/entities/user.entity';
import { Company } from '../company/entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Forecast,
      ExpenseCategory,
      ExpenseSubCategory,
      User,
      Company,
    ]),
  ],
  providers: [ForecastResolver, ForecastService, JwtService],
  exports: [ForecastService],
})
export class ForecastModule {}
