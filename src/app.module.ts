import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './config/database.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { join } from 'path';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AuthModule } from './modules/auth/auth.module';
import { SeedService } from './seeder/seed.service';
import { SeedModule } from './seeder/seed.module';
import { ExpenseCategoryModule } from './modules/expense-category/expense-category.module';
import { ExpenseSubCategoryModule } from './modules/expense-sub-category/expense-sub-category.module';

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
    AuthModule,
    SeedModule,
    ExpenseCategoryModule,
    ExpenseSubCategoryModule,
  ]
})
export class AppModule implements OnModuleInit {
  constructor(private readonly seedService: SeedService) {}

  async onModuleInit() {
    await this.seedService.createDefaultRoles();
    await this.seedService.createDefaultAdmin();
  }
}
