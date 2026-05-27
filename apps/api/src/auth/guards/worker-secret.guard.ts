import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { getApiEnvironment } from '../../common/config/env.validation';

@Injectable()
export class WorkerSecretGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
    }>();
    const env = getApiEnvironment(process.env);
    const providedSecret = request.headers['x-worker-secret'];

    if (!env.workerApiSecret || !providedSecret || providedSecret !== env.workerApiSecret) {
      throw new UnauthorizedException('Worker no autorizado.');
    }

    return true;
  }
}
