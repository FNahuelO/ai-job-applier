import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type {
  DashboardApplication,
  DashboardJob,
  DashboardMetric
} from './dashboard.service';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  getMetrics(@CurrentUser() user: AuthenticatedUser): Promise<DashboardMetric[]> {
    return this.dashboardService.getMetrics(user.id);
  }

  @Get('jobs')
  getJobs(): Promise<DashboardJob[]> {
    return this.dashboardService.getJobs();
  }

  @Get('applications')
  getApplications(@CurrentUser() user: AuthenticatedUser): Promise<DashboardApplication[]> {
    return this.dashboardService.getApplications(user.id);
  }

  @Get('worker-logs')
  getWorkerLogs(@CurrentUser() user: AuthenticatedUser): Promise<string[]> {
    return this.dashboardService.getWorkerLogs(user.id);
  }
}
