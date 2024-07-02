import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../modules/roles/entities/role.entity';
import { User } from '../modules/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, User])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
