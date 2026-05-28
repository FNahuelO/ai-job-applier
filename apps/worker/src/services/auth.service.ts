import type { BrowserContext, Page } from 'playwright';

export class AuthService {
  async ensureLinkedInSession(context: BrowserContext): Promise<Page> {
    const page = await context.newPage();
    await this.navigateToFeed(page);

    if (await this.isLoggedIn(page)) {
      return page;
    }

    throw new Error(
      'La sesión de LinkedIn expiró. Volvé al dashboard y reconectá tu cuenta.'
    );
  }

  private async isLoggedIn(page: Page): Promise<boolean> {
    return page.locator('[data-test-global-nav-link="feed"]').isVisible().catch(() => false);
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
