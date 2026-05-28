import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '../auth/auth.module';
import { Application } from '../database/models/application.model';
import { Job } from '../database/models/job.model';
import { LinkedInConnectRequest } from '../database/models/linkedin-connect-request.model';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Application, Job, LinkedInConnectRequest]),
    AuthModule
  ],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}
