import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '../auth/auth.module';
import { LinkedInConnectRequest } from '../database/models/linkedin-connect-request.model';
import { LinkedInSession } from '../database/models/linkedin-session.model';
import { LinkedInController } from './linkedin.controller';
import { LinkedInService } from './linkedin.service';

@Module({
  imports: [SequelizeModule.forFeature([LinkedInConnectRequest, LinkedInSession]), AuthModule],
  controllers: [LinkedInController],
  providers: [LinkedInService],
  exports: [LinkedInService]
})
export class LinkedInModule {}
