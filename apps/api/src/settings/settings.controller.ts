import { Body, Controller, Get, Patch } from '@nestjs/common';
import type { WorkerSettings } from '@ai-job-applier/shared';
import { UpdateWorkerSettingsDto } from './dto/update-worker-settings.dto';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings(): Promise<WorkerSettings> {
    return this.settingsService.getSettings();
  }

  @Patch()
  updateSettings(@Body() dto: UpdateWorkerSettingsDto): Promise<WorkerSettings> {
    return this.settingsService.updateSettings(dto);
  }
}
