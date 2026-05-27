import type { SequelizeModuleOptions } from '@nestjs/sequelize';
import {
  AiLog,
  Application,
  Company,
  Job,
  LinkedInConnectRequest,
  LinkedInSession,
  User
} from '../../database/models';

function resolveDatabaseUrl(env: NodeJS.ProcessEnv): string {
  const candidates = [
    env.DATABASE_URL,
    env.POSTGRES_URL,
    env.POSTGRES_PRISMA_URL,
    env.POSTGRES_URL_NON_POOLING
  ];

  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value) {
      return value;
    }
  }

  throw new Error(
    'DATABASE_URL es obligatorio. Configuralo en Vercel (Production) con la URL de Neon.'
  );
}

function parsePostgresUrl(databaseUrl: string) {
  const match = databaseUrl.trim().match(
    /^postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:/]+)(?::(\d+))?\/([^?]+)/
  );

  if (!match) {
    throw new Error('DATABASE_URL tiene un formato inválido.');
  }

  const [, username, password, host, port, database] = match;

  return {
    host,
    port: port ? Number(port) : 5432,
    username: decodeURIComponent(username),
    password: decodeURIComponent(password),
    database
  };
}

export function createSequelizeOptions(env: NodeJS.ProcessEnv): SequelizeModuleOptions {
  const databaseUrl = resolveDatabaseUrl(env);
  const nodeEnv = env.NODE_ENV ?? 'development';
  const connection = parsePostgresUrl(databaseUrl);
  const isLocalDatabase =
    connection.host === 'localhost' || connection.host === '127.0.0.1';

  if (env.VERCEL && isLocalDatabase) {
    throw new Error(
      'DATABASE_URL en Vercel apunta a localhost. Pegá la URL de Neon en Settings → Environment Variables.'
    );
  }

  const requiresSsl =
    databaseUrl.includes('neon.tech') ||
    databaseUrl.includes('sslmode=require') ||
    databaseUrl.includes('ssl=true');

  return {
    dialect: 'postgres',
    host: connection.host,
    port: connection.port,
    username: connection.username,
    password: connection.password,
    database: connection.database,
    autoLoadModels: true,
    synchronize: false,
    logging: nodeEnv === 'development',
    dialectOptions: requiresSsl
      ? {
          ssl: {
            rejectUnauthorized: false
          }
        }
      : undefined,
    models: [User, Company, Job, Application, AiLog, LinkedInConnectRequest, LinkedInSession]
  };
}
