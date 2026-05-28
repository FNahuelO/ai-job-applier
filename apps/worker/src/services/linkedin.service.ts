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

    console.log(
      JSON.stringify({
        event: 'jobs_search_completed',
        searchUrl,
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
