import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module';
import { getApiEnvironment } from './common/config/env.validation';
import {
  AiLog,
  Application,
  Company,
  Job,
  LinkedInConnectRequest,
  LinkedInSession,
  User
} from './database/models';
import { HealthController } from './health/health.controller';
import { LinkedInModule } from './linkedin/linkedin.module';
import { SettingsModule } from './settings/settings.module';
import { WorkerApiModule } from './worker/worker.module';

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
          models: [
            User,
            Company,
            Job,
            Application,
            AiLog,
            LinkedInConnectRequest,
            LinkedInSession
          ]
        };
      }
    }),
    AuthModule,
    SettingsModule,
    LinkedInModule,
    WorkerApiModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
