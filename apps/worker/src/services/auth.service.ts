import type { BrowserContext, Page } from 'playwright';

export class AuthService {
  async ensureLinkedInSession(context: BrowserContext): Promise<Page> {
    const page = await context.newPage();
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });

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
}
