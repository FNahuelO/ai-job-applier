import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppSettings } from '../database/models/app-settings.model';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [SequelizeModule.forFeature([AppSettings])],
  controllers: [SettingsController],
  providers: [SettingsService]
})
export class SettingsModule {}
