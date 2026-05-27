import { AuthService } from './services/auth.service.js';
import { BrowserService } from './services/browser.service.js';
import { ApplyService } from './services/apply.service.js';
import { LinkedInService } from './services/linkedin.service.js';
import { getWorkerEnvironment } from './config/env.js';
import { fetchJobSearchTitle } from './services/settings.service.js';
import { randomDelay } from './utils/humanize.js';

async function bootstrap(): Promise<void> {
  const env = getWorkerEnvironment(process.env);
  const browserService = new BrowserService();
  const authService = new AuthService();
  const linkedinService = new LinkedInService();
  const applyService = new ApplyService();

  const { browser, context } = await browserService.createContext();

  try {
    const page = await authService.ensureLinkedInSession(context);
    const jobSearchTitle = await fetchJobSearchTitle(env.apiBaseUrl);
    const jobs = await linkedinService.searchRelevantJobs(page, jobSearchTitle);

    for (const job of jobs) {
      await linkedinService.openJob(page, job.url);
      const applied = await applyService.attemptEasyApply(page);
      console.log(
        JSON.stringify({
          job,
          applied,
          timestamp: new Date().toISOString()
        })
      );
      await randomDelay(3000, 6500);
    }
  } finally {
    await context.close();
    await browser.close();
  }
}

void bootstrap();
