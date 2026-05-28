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

interface ScrapedJobCard {
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
      location: 'Remote',
      f_AL: 'true'
    });

    return `https://www.linkedin.com/jobs/search/?${params.toString()}`;
  }

  private async scrapeJobCards(page: Page): Promise<ScrapedJobCard[]> {
    return page.evaluate(() => {
      const easyApplyPattern = /easy apply|solicitud sencilla|aplicaci[oó]n sencilla/i;
      const nodes = Array.from(
        document.querySelectorAll(
          'li[data-occludable-job-id], li[data-job-id], .jobs-search-results__list-item'
        )
      );

      const seen = new Set<string>();
      const results: ScrapedJobCard[] = [];

      for (const node of nodes) {
        const link = node.querySelector<HTMLAnchorElement>(
          'a[href*="/jobs/view/"], a.job-card-container__link, a.job-card-list__title'
        );
        const href = link?.href ?? '';
        if (!href.includes('/jobs/view/') || seen.has(href)) {
          continue;
        }

        const title =
          node.querySelector<HTMLElement>('.job-card-list__title, .job-card-container__link strong')?.textContent?.trim() ??
          link?.textContent?.trim() ??
          '';
        const company =
          node.querySelector<HTMLElement>('.artdeco-entity-lockup__subtitle, .job-card-container__company-name, .job-card-container__primary-description')?.textContent?.trim() ??
          '';
        const location =
          node.querySelector<HTMLElement>('.job-card-container__metadata-item')?.textContent?.trim() ??
          '';
        const easyApply = easyApplyPattern.test(node.textContent ?? '');

        if (!title) {
          continue;
        }

        seen.add(href);
        results.push({ title, company, location, url: href, easyApply });
      }

      return results;
    });
  }

  async searchRelevantJobs(page: Page, jobSearchTitle?: string): Promise<LinkedInJobCard[]> {
    const searchUrl = this.buildJobsSearchUrl(jobSearchTitle);
    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded'
    });

    await randomDelay(2000, 4000);
    await humanScroll(page);
    await page
      .waitForSelector('li[data-occludable-job-id], .jobs-search-results__list-item', {
        timeout: 25000
      })
      .catch(() => undefined);

    const scraped = await this.scrapeJobCards(page);
    const results: LinkedInJobCard[] = scraped.slice(0, 10).map((job) => ({
      ...job,
      url: job.url.startsWith('http') ? job.url : `https://www.linkedin.com${job.url}`
    }));

    console.log(
      JSON.stringify({
        event: 'jobs_search_completed',
        searchUrl,
        currentUrl: page.url(),
        pageTitle: await page.title().catch(() => ''),
        totalCardsScanned: scraped.length,
        easyApplyJobsFound: results.filter((job) => job.easyApply).length,
        jobsReturned: results.length,
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
