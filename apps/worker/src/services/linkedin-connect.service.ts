import { chromium } from 'playwright';
import { ApiClientService } from './api-client.service.js';

export class LinkedInConnectService {
  constructor(private readonly apiClient: ApiClientService) {}

  async processPendingRequests(): Promise<void> {
    const pending = await this.apiClient.getPendingLinkedInConnects();

    for (const request of pending) {
      console.log(
        JSON.stringify({
          event: 'linkedin_connect_started',
          connectId: request.connectId,
          userId: request.userId,
          timestamp: new Date().toISOString()
        })
      );

      try {
        const storageState = await this.runManualLoginFlow();
        await this.apiClient.completeLinkedInConnect(request.connectId, storageState);
        console.log(
          JSON.stringify({
            event: 'linkedin_connect_completed',
            connectId: request.connectId,
            userId: request.userId,
            timestamp: new Date().toISOString()
          })
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        await this.apiClient.failLinkedInConnect(request.connectId, message);
        console.error(
          JSON.stringify({
            event: 'linkedin_connect_failed',
            connectId: request.connectId,
            userId: request.userId,
            error: message,
            timestamp: new Date().toISOString()
          })
        );
      }
    }
  }

  private async runManualLoginFlow() {
    const browser = await chromium.launch({
      headless: false,
      slowMo: 100
    });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 960 }
    });
    const page = await context.newPage();

    try {
      await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' });
      await page.waitForURL(/linkedin\.com\/(feed|checkpoint|jobs)/iu, {
        timeout: 10 * 60 * 1000
      });
      await page.waitForLoadState('networkidle');
      return await context.storageState();
    } finally {
      await context.close();
      await browser.close();
    }
  }
}
