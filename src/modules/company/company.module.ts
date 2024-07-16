import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyResolver } from './company.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { JwtService } from '@nestjs/jwt';
import { Staff } from '../staff/entities/staff.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Staff])],
  providers: [CompanyResolver, CompanyService, JwtService],
  exports: [CompanyService],
})
export class CompanyModule {}
