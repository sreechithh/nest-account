import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './config/database.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { join } from 'path';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BankAccountModule } from './modules/bank-account/bank-account.module';
import { AuthModule } from './modules/auth/auth.module';
import { SeedService } from './seeder/seed.service';
import { SeedModule } from './seeder/seed.module';
import { CompanyModule } from './modules/company/company.module';
import { IsUniqueConstraint } from './modules/common/decorators/unique.validator';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    DatabaseModule,
    UsersModule,
    RolesModule,
    BankAccountModule,
    AuthModule,
    SeedModule,
    CompanyModule,
  ],
  providers: [IsUniqueConstraint],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly seedService: SeedService) {}

  async onModuleInit() {
    await this.seedService.createDefaultRoles();
    await this.seedService.createDefaultAdmin();
  }
}
