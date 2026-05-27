import path from 'node:path';

export interface WorkerEnvironment {
  linkedinEmail: string;
  linkedinPassword: string;
  linkedInSessionPath: string;
  screenshotsDir: string;
  headless: boolean;
  slowMo: number;
  timeoutMs: number;
  apiBaseUrl: string;
}

export function getWorkerEnvironment(env: NodeJS.ProcessEnv): WorkerEnvironment {
  return {
    linkedinEmail: env.LINKEDIN_EMAIL ?? '',
    linkedinPassword: env.LINKEDIN_PASSWORD ?? '',
    linkedInSessionPath: path.resolve(
      env.LINKEDIN_SESSION_PATH ?? './storage/state/linkedin-session.json'
    ),
    screenshotsDir: path.resolve(
      env.PLAYWRIGHT_ERROR_SCREENSHOT_DIR ?? './storage/screenshots'
    ),
    headless: env.PLAYWRIGHT_HEADLESS === 'true',
    slowMo: Number(env.PLAYWRIGHT_SLOW_MO ?? 150),
    timeoutMs: Number(env.PLAYWRIGHT_TIMEOUT_MS ?? 45000),
    apiBaseUrl: env.API_BASE_URL ?? 'http://localhost:3000/api'
  };
}
