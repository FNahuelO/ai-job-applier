import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import type { CreationAttributes } from 'sequelize';
import type { UpdateWorkerSettingsInput, WorkerSettings } from '@ai-job-applier/shared';
import { AppSettings } from '../database/models/app-settings.model';
import { UpdateWorkerSettingsDto } from './dto/update-worker-settings.dto';

const SETTINGS_ID = 'default';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectModel(AppSettings)
    private readonly appSettingsModel: typeof AppSettings
  ) {}

  async onModuleInit(): Promise<void> {
    const existing = await this.appSettingsModel.findByPk(SETTINGS_ID);

    if (!existing) {
      await this.appSettingsModel.create({
        id: SETTINGS_ID,
        jobSearchTitle: ''
      } as CreationAttributes<AppSettings>);
    }
  }

  async getSettings(): Promise<WorkerSettings> {
    const row = await this.appSettingsModel.findByPk(SETTINGS_ID);

    if (!row) {
      throw new NotFoundException('Configuración no encontrada.');
    }

    return { jobSearchTitle: row.jobSearchTitle };
  }

  async updateSettings(dto: UpdateWorkerSettingsDto): Promise<WorkerSettings> {
    const row = await this.appSettingsModel.findByPk(SETTINGS_ID);

    if (!row) {
      throw new NotFoundException('Configuración no encontrada.');
    }

    const payload: UpdateWorkerSettingsInput = {
      jobSearchTitle: dto.jobSearchTitle.trim()
    };

    row.jobSearchTitle = payload.jobSearchTitle;
    await row.save();

    return { jobSearchTitle: row.jobSearchTitle };
  }
}
