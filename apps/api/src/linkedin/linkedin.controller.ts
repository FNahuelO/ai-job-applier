import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import type {
  LinkedInAccountStatus,
  LinkedInConnectStartResponse,
  LinkedInConnectStatusResponse
} from '@ai-job-applier/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LinkedInService } from './linkedin.service';

@Controller('linkedin')
@UseGuards(JwtAuthGuard)
export class LinkedInController {
  constructor(private readonly linkedInService: LinkedInService) {}

  @Post('connect')
  startConnect(@CurrentUser() user: AuthenticatedUser): Promise<LinkedInConnectStartResponse> {
    return this.linkedInService.startConnect(user.id);
  }

  @Get('connect/:token/status')
  getConnectStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('token') token: string
  ): Promise<LinkedInConnectStatusResponse> {
    return this.linkedInService.getConnectStatus(user.id, token);
  }

  @Get('status')
  getAccountStatus(@CurrentUser() user: AuthenticatedUser): Promise<LinkedInAccountStatus> {
    return this.linkedInService.getAccountStatus(user.id);
  }

  @Delete('disconnect')
  disconnect(@CurrentUser() user: AuthenticatedUser): Promise<LinkedInAccountStatus> {
    return this.linkedInService.disconnect(user.id);
  }
}
