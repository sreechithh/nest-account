import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffResolver } from './staff.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { Company } from '../company/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Staff, Company])],
  providers: [StaffResolver, StaffService],
})
export class StaffModule {}
