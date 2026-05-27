import path from 'node:path';

export interface WorkerEnvironment {
  linkedInSessionPath: string;
  screenshotsDir: string;
  headless: boolean;
  slowMo: number;
  timeoutMs: number;
  apiBaseUrl: string;
  workerApiSecret: string;
  pollIntervalMs: number;
}

export function getWorkerEnvironment(env: NodeJS.ProcessEnv): WorkerEnvironment {
  const workerApiSecret = env.WORKER_API_SECRET?.trim();

  if (!workerApiSecret) {
    throw new Error('WORKER_API_SECRET es obligatorio.');
  }

  return {
    linkedInSessionPath: path.resolve(
      env.LINKEDIN_SESSION_PATH ?? './storage/state/linkedin-session.json'
    ),
    screenshotsDir: path.resolve(
      env.PLAYWRIGHT_ERROR_SCREENSHOT_DIR ?? './storage/screenshots'
    ),
    headless: env.PLAYWRIGHT_HEADLESS === 'true',
    slowMo: Number(env.PLAYWRIGHT_SLOW_MO ?? 150),
    timeoutMs: Number(env.PLAYWRIGHT_TIMEOUT_MS ?? 45000),
    apiBaseUrl: env.API_BASE_URL ?? 'http://localhost:3000/api',
    workerApiSecret,
    pollIntervalMs: Number(env.WORKER_POLL_INTERVAL_MS ?? 15000)
  };
}
