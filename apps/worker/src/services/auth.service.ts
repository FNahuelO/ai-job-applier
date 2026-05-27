import { access } from 'node:fs/promises';
import type { BrowserContext, Page } from 'playwright';
import { getWorkerEnvironment } from '../config/env.js';
import { randomDelay } from '../utils/humanize.js';

export class AuthService {
  async ensureLinkedInSession(context: BrowserContext): Promise<Page> {
    const env = getWorkerEnvironment(process.env);
    const page = await context.newPage();

    const hasStoredSession = await access(env.linkedInSessionPath)
      .then(() => true)
      .catch(() => false);

    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });

    if (await this.isLoggedIn(page)) {
      return page;
    }

    await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' });

    if (env.linkedinEmail && env.linkedinPassword) {
      await page.getByLabel(/email|correo/i).fill(env.linkedinEmail);
      await page.getByLabel(/password|contrase/iu).fill(env.linkedinPassword);
      await randomDelay();
      await page.getByRole('button', { name: /sign in|iniciar sesi/iu }).click();
    } else if (!hasStoredSession) {
      // Se espera un login manual la primera vez para mantener una sesion estable.
      await page.waitForURL(/linkedin\.com\/feed|linkedin\.com\/checkpoint/iu, {
        timeout: 5 * 60 * 1000
      });
    }

    await page.waitForLoadState('networkidle');
    await context.storageState({ path: env.linkedInSessionPath });

    return page;
  }

  private async isLoggedIn(page: Page): Promise<boolean> {
    return page.locator('[data-test-global-nav-link="feed"]').isVisible().catch(() => false);
  }
}
