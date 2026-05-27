import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import type { UpdateWorkerSettingsInput, WorkerSettings } from '@ai-job-applier/shared';
import { User } from '../database/models/user.model';
import { UpdateWorkerSettingsDto } from './dto/update-worker-settings.dto';

@Injectable()
export class SettingsService {
  constructor(@InjectModel(User) private readonly userModel: typeof User) {}

  async getSettings(userId: string): Promise<WorkerSettings> {
    const user = await this.userModel.findByPk(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return { jobSearchTitle: user.jobSearchTitle };
  }

  async updateSettings(userId: string, dto: UpdateWorkerSettingsDto): Promise<WorkerSettings> {
    const user = await this.userModel.findByPk(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const payload: UpdateWorkerSettingsInput = {
      jobSearchTitle: dto.jobSearchTitle.trim()
    };

    user.jobSearchTitle = payload.jobSearchTitle;
    await user.save();

    return { jobSearchTitle: user.jobSearchTitle };
  }
}
