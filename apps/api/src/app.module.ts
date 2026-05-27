import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { getApiEnvironment } from './common/config/env.validation';
import { HealthController } from './health/health.controller';
import { AiLog, AppSettings, Application, Company, Job, User } from './database/models';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true
    }),
    SequelizeModule.forRootAsync({
      useFactory: () => {
        const env = getApiEnvironment(process.env);

        return {
          dialect: 'postgres',
          url: env.databaseUrl,
          autoLoadModels: true,
          synchronize: false,
          logging: env.nodeEnv === 'development',
          models: [User, Company, Job, Application, AiLog, AppSettings]
        };
      }
    }),
    SettingsModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
