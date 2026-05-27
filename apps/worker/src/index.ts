import { AuthService } from './services/auth.service.js';
import { ApiClientService } from './services/api-client.service.js';
import { ApplyService } from './services/apply.service.js';
import { BrowserService } from './services/browser.service.js';
import { LinkedInConnectService } from './services/linkedin-connect.service.js';
import { LinkedInService } from './services/linkedin.service.js';
import { getWorkerEnvironment } from './config/env.js';
import { randomDelay } from './utils/humanize.js';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function processUsers(apiClient: ApiClientService): Promise<void> {
  const authService = new AuthService();
  const browserService = new BrowserService();
  const linkedinService = new LinkedInService();
  const applyService = new ApplyService();
  const activeUsers = await apiClient.getActiveUsers();

  for (const user of activeUsers) {
    console.log(
      JSON.stringify({
        event: 'user_run_started',
        userId: user.userId,
        email: user.email,
        timestamp: new Date().toISOString()
      })
    );

    const storageState = await apiClient.getUserLinkedInSession(user.userId);
    const { browser, context } = await browserService.createContext(storageState);

    try {
      const page = await authService.ensureLinkedInSession(context);
      const jobs = await linkedinService.searchRelevantJobs(page, user.jobSearchTitle);

      for (const job of jobs) {
        await linkedinService.openJob(page, job.url);
        const applied = await applyService.attemptEasyApply(page);
        console.log(
          JSON.stringify({
            event: 'job_processed',
            userId: user.userId,
            job,
            applied,
            timestamp: new Date().toISOString()
          })
        );
        await randomDelay(3000, 6500);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      console.error(
        JSON.stringify({
          event: 'user_run_failed',
          userId: user.userId,
          error: message,
          timestamp: new Date().toISOString()
        })
      );
    } finally {
      await context.close();
      await browser.close();
    }
  }
}

async function runCycle(
  apiClient: ApiClientService,
  linkedInConnectService: LinkedInConnectService
): Promise<void> {
  await linkedInConnectService.processPendingRequests();
  await processUsers(apiClient);
}

async function bootstrap(): Promise<void> {
  const env = getWorkerEnvironment(process.env);
  const apiClient = new ApiClientService();
  const linkedInConnectService = new LinkedInConnectService(apiClient);

  console.log(
    JSON.stringify({
      event: 'worker_started',
      pollIntervalMs: env.pollIntervalMs,
      timestamp: new Date().toISOString()
    })
  );

  while (true) {
    try {
      await runCycle(apiClient, linkedInConnectService);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      console.error(
        JSON.stringify({
          event: 'worker_cycle_failed',
          error: message,
          timestamp: new Date().toISOString()
        })
      );
    }

    await sleep(env.pollIntervalMs);
  }
}

void bootstrap();
