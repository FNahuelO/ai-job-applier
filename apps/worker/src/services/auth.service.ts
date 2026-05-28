import type { BrowserContext, Page } from 'playwright';

export class AuthService {
  async ensureLinkedInSession(context: BrowserContext): Promise<Page> {
    const page = await context.newPage();
    await this.navigateToFeed(page);
    await page.waitForTimeout(1500);

    if (await this.isLoggedIn(page)) {
      return page;
    }

    throw new Error(
      'La sesión de LinkedIn expiró. Volvé al dashboard y reconectá tu cuenta.'
    );
  }

  private async isLoggedIn(page: Page): Promise<boolean> {
    const currentUrl = page.url();
    const isAppUrl = /linkedin\.com\/(feed|jobs|mynetwork|messaging)/iu.test(currentUrl);
    const isLoginUrl = /linkedin\.com\/(login|checkpoint|uas\/login)/iu.test(currentUrl);

    if (isAppUrl && !isLoginUrl) {
      return true;
    }

    const hasLoginForm = await page
      .locator('input[name="session_key"], #username')
      .first()
      .isVisible()
      .catch(() => false);
    if (hasLoginForm) {
      return false;
    }

    const hasNav = await page
      .locator('[data-test-global-nav-link="feed"], .global-nav__me, nav[aria-label*="principal"]')
      .first()
      .isVisible()
      .catch(() => false);

    return hasNav;
  }

  private async navigateToFeed(page: Page): Promise<void> {
    try {
      await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('net::ERR_ABORTED') || message.includes('frame was detached')) {
        await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
        return;
      }
      throw error;
    }
  }
}
