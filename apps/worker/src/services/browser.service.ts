import { access, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium, type Browser, type BrowserContext } from 'playwright';
import { getWorkerEnvironment } from '../config/env.js';

export class BrowserService {
  async createContext(): Promise<{ browser: Browser; context: BrowserContext }> {
    const env = getWorkerEnvironment(process.env);
    const hasStorageState = await access(env.linkedInSessionPath)
      .then(() => true)
      .catch(() => false);

    await mkdir(path.dirname(env.linkedInSessionPath), { recursive: true });

    const browser = await chromium.launch({
      headless: env.headless,
      slowMo: env.slowMo
    });

    const context = await browser.newContext({
      storageState: hasStorageState ? env.linkedInSessionPath : undefined,
      viewport: { width: 1440, height: 960 }
    });

    context.setDefaultNavigationTimeout(env.timeoutMs);
    context.setDefaultTimeout(env.timeoutMs);

    return { browser, context };
  }
}
