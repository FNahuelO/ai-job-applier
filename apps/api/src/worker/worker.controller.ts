import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { WorkerSecretGuard } from '../auth/guards/worker-secret.guard';
import { LinkedInSession } from '../database/models/linkedin-session.model';
import { User } from '../database/models/user.model';
import { CompleteLinkedInConnectDto } from '../linkedin/dto/complete-linkedin-connect.dto';
import { FailLinkedInConnectDto } from '../linkedin/dto/fail-linkedin-connect.dto';
import { LinkedInService } from '../linkedin/linkedin.service';

interface ActiveWorkerUser {
  userId: string;
  email: string;
  jobSearchTitle: string;
}

@Controller('worker')
@UseGuards(WorkerSecretGuard)
export class WorkerController {
  constructor(
    private readonly linkedInService: LinkedInService,
    @InjectModel(LinkedInSession)
    private readonly linkedInSessionModel: typeof LinkedInSession
  ) {}

  @Get('linkedin/pending')
  getPendingConnects() {
    return this.linkedInService.getPendingConnectRequests();
  }

  @Post('linkedin/:connectId/complete')
  completeConnect(
    @Param('connectId') connectId: string,
    @Body() dto: CompleteLinkedInConnectDto
  ) {
    return this.linkedInService.completeConnect(connectId, dto.storageState);
  }

  @Post('linkedin/:connectId/fail')
  failConnect(@Param('connectId') connectId: string, @Body() dto: FailLinkedInConnectDto) {
    return this.linkedInService.failConnect(connectId, dto.error);
  }

  @Get('users/active')
  async getActiveUsers(): Promise<ActiveWorkerUser[]> {
    const sessions = await this.linkedInSessionModel.findAll({
      where: { status: 'active' },
      include: [User]
    });

    return sessions
      .filter((session) => session.user)
      .map((session) => ({
        userId: session.userId,
        email: session.user!.email,
        jobSearchTitle: session.user!.jobSearchTitle
      }));
  }

  @Get('users/:userId/linkedin-session')
  getUserLinkedInSession(@Param('userId') userId: string) {
    return this.linkedInService.getSessionStorageState(userId);
  }
}
