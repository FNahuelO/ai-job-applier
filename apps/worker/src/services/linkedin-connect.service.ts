import { chromium } from 'playwright';
import { getWorkerEnvironment } from '../config/env.js';
import { ApiClientService } from './api-client.service.js';

export class LinkedInConnectService {
  constructor(private readonly apiClient: ApiClientService) {}

  private static readonly CONNECT_TIMEOUT_MS = 10 * 60 * 1000;
  private static readonly WAIT_SLICE_MS = 1000;

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
    const env = getWorkerEnvironment(process.env);
    const browser = await chromium.launch({
      // El flujo de conexión requiere interacción manual del usuario.
      headless: false,
      slowMo: env.slowMo
    });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 960 }
    });
    const page = await context.newPage();

    try {
      await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' });

      const loggedInRegex = /linkedin\.com\/(feed|jobs)/iu;
      const deadline = Date.now() + LinkedInConnectService.CONNECT_TIMEOUT_MS;

      // En algunos desafíos LinkedIn cierra/reemplaza la pestaña original.
      // Por eso revisamos todas las páginas del contexto en lugar de una sola.
      while (Date.now() < deadline) {
        let pages = context.pages().filter((p) => !p.isClosed());

        for (const currentPage of pages) {
          const currentUrl = currentPage.url();
          if (loggedInRegex.test(currentUrl)) {
            await currentPage.waitForLoadState('domcontentloaded').catch(() => undefined);
            return await context.storageState();
          }
        }

        if (pages.length === 0) {
          // LinkedIn puede cerrar y abrir pestañas durante el challenge.
          // Esperamos brevemente para que aparezca una nueva antes de fallar.
          await Promise.race([
            context.waitForEvent('page').catch(() => undefined),
            new Promise((resolve) =>
              setTimeout(resolve, LinkedInConnectService.WAIT_SLICE_MS)
            )
          ]);
          pages = context.pages().filter((p) => !p.isClosed());
          if (pages.length === 0) {
            continue;
          }
        }

        await pages[0]
          .waitForURL(loggedInRegex, { timeout: 1500, waitUntil: 'domcontentloaded' })
          .catch(() => undefined);
      }

      throw new Error('No se detectó login completo en LinkedIn dentro del tiempo esperado.');
    } finally {
      await context.close();
      await browser.close();
    }
  }
}
