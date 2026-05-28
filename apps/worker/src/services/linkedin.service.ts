import { defaultJobSearchFilters } from '@ai-job-applier/shared';
import type { Page } from 'playwright';
import { humanMoveMouse, humanScroll, randomDelay } from '../utils/humanize.js';

export interface LinkedInJobCard {
  title: string;
  company: string;
  location: string;
  url: string;
  easyApply: boolean;
}

export class LinkedInService {
  private async firstVisible(page: Page, selectors: string[]) {
    for (const selector of selectors) {
      const locator = page.locator(selector).first();
      const visible = await locator.isVisible().catch(() => false);
      if (visible) {
        return locator;
      }
    }

    return null;
  }

  async openJobs(page: Page): Promise<void> {
    await page.goto('https://www.linkedin.com/jobs/', {
      waitUntil: 'domcontentloaded'
    });
    await randomDelay();
  }

  async searchRelevantJobs(page: Page, jobSearchTitle?: string): Promise<LinkedInJobCard[]> {
    await this.openJobs(page);

    const searchQuery = jobSearchTitle?.trim() || defaultJobSearchFilters.keywords.join(' OR ');
    const searchInput = await this.firstVisible(page, [
      'input[aria-label*="title" i]',
      'input[aria-label*="cargo" i]',
      'input[aria-label*="puesto" i]',
      'input[placeholder*="Search by title" i]',
      'input[placeholder*="Buscar por puesto" i]',
      'input[id*="jobs-search-box-keyword-id"]'
    ]);

    if (!searchInput) {
      throw new Error('No se encontró el campo de búsqueda de puesto en LinkedIn Jobs.');
    }

    await searchInput.fill(searchQuery);

    const locationInput = await this.firstVisible(page, [
      'input[aria-label*="location" i]',
      'input[aria-label*="ubicación" i]',
      'input[placeholder*="City, state, or zip code" i]',
      'input[placeholder*="Ciudad" i]',
      'input[id*="jobs-search-box-location-id"]'
    ]);

    if (locationInput) {
      await locationInput.fill('Remote');
      await locationInput.press('Enter');
    } else {
      await searchInput.press('Enter');
    }

    await randomDelay(1500, 3200);
    await humanScroll(page);

    const cards = await page.locator('.jobs-search-results__list-item').all();
    const results: LinkedInJobCard[] = [];

    for (const card of cards.slice(0, 10)) {
      const link = card.locator('a').first();
      const title = (await card.locator('.job-card-list__title').textContent())?.trim() ?? '';
      const company =
        (await card.locator('.artdeco-entity-lockup__subtitle').textContent())?.trim() ?? '';
      const location = (await card.locator('.job-card-container__metadata-item').textContent())?.trim() ?? '';
      const url = (await link.getAttribute('href')) ?? '';
      const easyApply = await card.getByText(/easy apply/i).isVisible().catch(() => false);

      if (!title || !url || !easyApply) {
        continue;
      }

      results.push({
        title,
        company,
        location,
        url: url.startsWith('http') ? url : `https://www.linkedin.com${url}`,
        easyApply
      });
    }

    return results;
  }

  async openJob(page: Page, url: string): Promise<void> {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const box = await page.locator('body').boundingBox();

    if (box) {
      await humanMoveMouse(page.mouse, box.width / 2, Math.min(box.height / 4, 240));
    }

    await randomDelay(1200, 2800);
  }
}
