import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuthResolver } from './auth.resolver';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [JwtModule, UsersModule],
  providers: [AuthService, AuthResolver, AuthGuard],
  exports: [AuthService],
})
export class AuthModule {}
