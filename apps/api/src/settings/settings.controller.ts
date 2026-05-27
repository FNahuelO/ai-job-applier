import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import type { WorkerSettings } from '@ai-job-applier/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateWorkerSettingsDto } from './dto/update-worker-settings.dto';
import { SettingsService } from './settings.service';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings(@CurrentUser() user: AuthenticatedUser): Promise<WorkerSettings> {
    return this.settingsService.getSettings(user.id);
  }

  @Patch()
  updateSettings(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateWorkerSettingsDto
  ): Promise<WorkerSettings> {
    return this.settingsService.updateSettings(user.id, dto);
  }
}
