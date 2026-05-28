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
  private static readonly JOB_CARD_SELECTORS = [
    '.jobs-search-results__list-item',
    '.scaffold-layout__list-item',
    'li[data-occludable-job-id]',
    'li[data-job-id]'
  ] as const;

  private buildJobsSearchUrl(jobSearchTitle?: string): string {
    const searchQuery = jobSearchTitle?.trim() || defaultJobSearchFilters.keywords.join(' OR ');
    const params = new URLSearchParams({
      keywords: searchQuery,
      location: 'Remote'
    });

    return `https://www.linkedin.com/jobs/search/?${params.toString()}`;
  }

  async searchRelevantJobs(page: Page, jobSearchTitle?: string): Promise<LinkedInJobCard[]> {
    const searchUrl = this.buildJobsSearchUrl(jobSearchTitle);
    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded'
    });

    await randomDelay(1800, 3500);
    await humanScroll(page);
    await page.waitForSelector('main', { timeout: 20000 }).catch(() => undefined);

    let cards = await page.locator(LinkedInService.JOB_CARD_SELECTORS[0]).all();
    for (const selector of LinkedInService.JOB_CARD_SELECTORS.slice(1)) {
      if (cards.length > 0) {
        break;
      }
      cards = await page.locator(selector).all();
    }

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

    console.log(
      JSON.stringify({
        event: 'jobs_search_completed',
        searchUrl,
        currentUrl: page.url(),
        pageTitle: await page.title().catch(() => ''),
        totalCardsScanned: Math.min(cards.length, 10),
        easyApplyJobsFound: results.length,
        timestamp: new Date().toISOString()
      })
    );

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
