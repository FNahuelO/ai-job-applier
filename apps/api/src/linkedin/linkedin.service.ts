import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { randomBytes } from 'node:crypto';
import type { CreationAttributes } from 'sequelize';
import { Op } from 'sequelize';
import type {
  LinkedInAccountStatus,
  LinkedInConnectStartResponse,
  LinkedInConnectStatus,
  LinkedInConnectStatusResponse
} from '@ai-job-applier/shared';
import { getApiEnvironment } from '../common/config/env.validation';
import { decryptJson, encryptJson } from '../common/crypto/encryption.util';
import { LinkedInConnectRequest } from '../database/models/linkedin-connect-request.model';
import { LinkedInSession } from '../database/models/linkedin-session.model';

const CONNECT_TTL_MS = 15 * 60 * 1000;

@Injectable()
export class LinkedInService {
  constructor(
    @InjectModel(LinkedInConnectRequest)
    private readonly connectRequestModel: typeof LinkedInConnectRequest,
    @InjectModel(LinkedInSession)
    private readonly linkedInSessionModel: typeof LinkedInSession
  ) {}

  async startConnect(userId: string): Promise<LinkedInConnectStartResponse> {
    await this.expirePendingRequests(userId);

    const token = randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + CONNECT_TTL_MS);
    const request = await this.connectRequestModel.create({
      userId,
      token,
      status: 'pending',
      expiresAt
    } as CreationAttributes<LinkedInConnectRequest>);

    return {
      connectId: request.id,
      token: request.token,
      expiresAt: request.expiresAt.toISOString()
    };
  }

  async getConnectStatus(
    userId: string,
    token: string
  ): Promise<LinkedInConnectStatusResponse> {
    const request = await this.connectRequestModel.findOne({
      where: { userId, token }
    });

    if (!request) {
      throw new NotFoundException('Solicitud de conexión no encontrada.');
    }

    if (request.status === 'pending' && request.expiresAt.getTime() < Date.now()) {
      request.status = 'expired';
      await request.save();
    }

    const session = await this.linkedInSessionModel.findByPk(userId);

    return {
      status: request.status as LinkedInConnectStatus,
      connectedAt: session?.connectedAt.toISOString(),
      error: request.errorMessage ?? undefined
    };
  }

  async getAccountStatus(userId: string): Promise<LinkedInAccountStatus> {
    const session = await this.linkedInSessionModel.findOne({
      where: { userId, status: 'active' }
    });

    return {
      connected: Boolean(session),
      connectedAt: session?.connectedAt.toISOString()
    };
  }

  async disconnect(userId: string): Promise<LinkedInAccountStatus> {
    await this.linkedInSessionModel.destroy({ where: { userId } });
    await this.connectRequestModel.destroy({
      where: { userId, status: { [Op.in]: ['pending', 'failed'] } }
    });

    return { connected: false };
  }

  async getPendingConnectRequests(): Promise<
    Array<{ connectId: string; token: string; userId: string }>
  > {
    await this.expireAllPendingRequests();

    const pending = await this.connectRequestModel.findAll({
      where: {
        status: 'pending',
        expiresAt: { [Op.gt]: new Date() }
      },
      order: [['created_at', 'ASC']]
    });

    return pending.map((request) => ({
      connectId: request.id,
      token: request.token,
      userId: request.userId
    }));
  }

  async completeConnect(
    connectId: string,
    storageState: Record<string, unknown>
  ): Promise<void> {
    const request = await this.connectRequestModel.findByPk(connectId);

    if (!request || request.status !== 'pending') {
      throw new NotFoundException('Solicitud de conexión no válida.');
    }

    if (request.expiresAt.getTime() < Date.now()) {
      request.status = 'expired';
      await request.save();
      throw new BadRequestException('La solicitud de conexión expiró.');
    }

    const env = getApiEnvironment(process.env);
    const encrypted = encryptJson(env.jwtSecret, storageState);

    const existingSession = await this.linkedInSessionModel.findByPk(request.userId);

    if (existingSession) {
      existingSession.storageStateEncrypted = encrypted;
      existingSession.status = 'active';
      existingSession.connectedAt = new Date();
      await existingSession.save();
    } else {
      await this.linkedInSessionModel.create({
        userId: request.userId,
        storageStateEncrypted: encrypted,
        status: 'active',
        connectedAt: new Date()
      } as CreationAttributes<LinkedInSession>);
    }

    request.status = 'completed';
    request.errorMessage = null;
    await request.save();
  }

  async failConnect(connectId: string, error: string): Promise<void> {
    const request = await this.connectRequestModel.findByPk(connectId);

    if (!request) {
      throw new NotFoundException('Solicitud de conexión no encontrada.');
    }

    request.status = 'failed';
    request.errorMessage = error;
    await request.save();
  }

  async getSessionStorageState(userId: string): Promise<Record<string, unknown>> {
    const session = await this.linkedInSessionModel.findOne({
      where: { userId, status: 'active' }
    });

    if (!session) {
      throw new NotFoundException('Sesión de LinkedIn no encontrada.');
    }

    const env = getApiEnvironment(process.env);
    return decryptJson<Record<string, unknown>>(env.jwtSecret, session.storageStateEncrypted);
  }

  private async expirePendingRequests(userId: string): Promise<void> {
    await this.connectRequestModel.update(
      { status: 'expired' },
      {
        where: {
          userId,
          status: 'pending',
          expiresAt: { [Op.lt]: new Date() }
        }
      }
    );
  }

  private async expireAllPendingRequests(): Promise<void> {
    await this.connectRequestModel.update(
      { status: 'expired' },
      {
        where: {
          status: 'pending',
          expiresAt: { [Op.lt]: new Date() }
        }
      }
    );
  }
}
