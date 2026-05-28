import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import {
  chromium,
  type Browser,
  type BrowserContext,
  type BrowserContextOptions
} from 'playwright';

type SessionStorageState = Exclude<BrowserContextOptions['storageState'], string | undefined>;
import { getWorkerEnvironment } from '../config/env.js';

export class BrowserService {
  async createContext(storageState: SessionStorageState): Promise<{
    browser: Browser;
    context: BrowserContext;
  }> {
    const env = getWorkerEnvironment(process.env);
    await mkdir(path.resolve('./storage/state'), { recursive: true });

    const browser = await chromium.launch({
      // Las ejecuciones periódicas del worker deben correr en segundo plano
      // para no abrir ventanas cada ciclo.
      headless: true,
      slowMo: env.slowMo
    });

    const context = await browser.newContext({
      storageState,
      viewport: { width: 1440, height: 960 }
    });

    context.setDefaultNavigationTimeout(env.timeoutMs);
    context.setDefaultTimeout(env.timeoutMs);

    return { browser, context };
  }
}
