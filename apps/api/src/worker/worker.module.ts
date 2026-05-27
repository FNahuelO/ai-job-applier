import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LinkedInSession } from '../database/models/linkedin-session.model';
import { LinkedInModule } from '../linkedin/linkedin.module';
import { WorkerController } from './worker.controller';

@Module({
  imports: [SequelizeModule.forFeature([LinkedInSession]), LinkedInModule],
  controllers: [WorkerController]
})
export class WorkerApiModule {}
