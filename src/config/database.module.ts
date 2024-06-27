import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB'),
        autoLoadEntities: true,
        synchronize: configService.getOrThrow<string>('ENV') === 'local',
        entities: ['src/modules/**/*.entity{.ts}'],
        cli: {
          migrationsDir: 'src/migrations',
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
