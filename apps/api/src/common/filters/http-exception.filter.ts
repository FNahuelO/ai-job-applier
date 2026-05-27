import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import type { Request, Response } from 'express';

function resolveInternalErrorMessage(exception: unknown): string {
  if (exception instanceof Error) {
    const sequelizeParent = (exception as Error & { parent?: Error }).parent;
    if (sequelizeParent?.message) {
      return sequelizeParent.message;
    }

    return exception.message;
  }

  return 'Unexpected internal error';
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!(exception instanceof HttpException)) {
      console.error('[API]', exception);
    }

    const payload =
      exception instanceof HttpException
        ? exception.getResponse()
        : {
            message: resolveInternalErrorMessage(exception)
          };

    response.status(status).json({
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      error: payload
    });
  }
}
