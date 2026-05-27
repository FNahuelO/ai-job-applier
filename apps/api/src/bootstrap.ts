import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { getApiEnvironment } from './common/config/env.validation';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

let cachedApp: NestExpressApplication | undefined;

export async function createNestApp(): Promise<NestExpressApplication> {
  if (cachedApp) {
    return cachedApp;
  }

  const env = getApiEnvironment(process.env);
  // En Vercel la función ya está montada bajo /api; el prefijo global duplicaría rutas.
  const apiPrefix = process.env.VERCEL ? '' : env.apiPrefix;
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true
  });

  app.use(helmet());
  app.use(cookieParser());
  app.setGlobalPrefix(apiPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.init();
  cachedApp = app;
  return app;
}

export async function startServer(): Promise<void> {
  const env = getApiEnvironment(process.env);
  const app = await createNestApp();
  await app.listen(env.apiPort);
}
