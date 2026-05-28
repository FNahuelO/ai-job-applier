import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module';
import { createSequelizeOptions } from './common/config/database.config';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthController } from './health/health.controller';
import { LinkedInModule } from './linkedin/linkedin.module';
import { SettingsModule } from './settings/settings.module';
import { WorkerApiModule } from './worker/worker.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.VERCEL === '1',
      expandVariables: false
    }),
    SequelizeModule.forRootAsync({
      useFactory: () => createSequelizeOptions(process.env)
    }),
    AuthModule,
    DashboardModule,
    SettingsModule,
    LinkedInModule,
    WorkerApiModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
