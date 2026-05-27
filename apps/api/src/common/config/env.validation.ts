export interface ApiEnvironment {
  nodeEnv: string;
  apiPort: number;
  apiPrefix: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  workerApiSecret: string;
}

function resolveDatabaseUrl(env: NodeJS.ProcessEnv): string {
  const candidates = [env.DATABASE_URL, env.POSTGRES_URL, env.POSTGRES_PRISMA_URL];

  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value) {
      return value;
    }
  }

  throw new Error('DATABASE_URL es obligatorio.');
}

export function getApiEnvironment(env: NodeJS.ProcessEnv): ApiEnvironment {
  const databaseUrl = resolveDatabaseUrl(env);
  const jwtSecret = env.JWT_SECRET?.trim();

  if (!jwtSecret) {
    throw new Error('JWT_SECRET es obligatorio.');
  }

  return {
    nodeEnv: env.NODE_ENV ?? 'development',
    apiPort: Number(env.API_PORT ?? 3000),
    apiPrefix: env.API_PREFIX ?? 'api',
    databaseUrl,
    jwtSecret,
    jwtExpiresIn: env.JWT_EXPIRES_IN ?? '7d',
    workerApiSecret: env.WORKER_API_SECRET?.trim() ?? ''
  };
}
