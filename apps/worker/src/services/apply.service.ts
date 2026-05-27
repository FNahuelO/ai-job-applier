import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { Page } from 'playwright';
import { getWorkerEnvironment } from '../config/env.js';
import { randomDelay } from '../utils/humanize.js';

export class ApplyService {
  async attemptEasyApply(page: Page): Promise<boolean> {
    const env = getWorkerEnvironment(process.env);
    await mkdir(env.screenshotsDir, { recursive: true });

    try {
      const easyApplyButton = page.getByRole('button', { name: /easy apply/i }).first();

      if (!(await easyApplyButton.isVisible().catch(() => false))) {
        return false;
      }

      await easyApplyButton.click();
      await randomDelay();

      const textarea = page.locator('textarea').first();
      if (await textarea.isVisible().catch(() => false)) {
        await textarea.fill(
          'I have solid experience building React, TypeScript and Node.js applications end-to-end.'
        );
        await randomDelay();
      }

      const nextButton = page.getByRole('button', { name: /next|review|continue|revisar/i }).first();
      if (await nextButton.isVisible().catch(() => false)) {
        await nextButton.click();
        await randomDelay();
      }

      const submitButton = page.getByRole('button', { name: /submit application|send application|enviar/i }).first();
      if (await submitButton.isVisible().catch(() => false)) {
        await submitButton.click();
        await randomDelay(1800, 3200);
        return true;
      }

      return false;
    } catch (error) {
      const filename = path.join(env.screenshotsDir, `apply-error-${Date.now()}.png`);
      await page.screenshot({ path: filename, fullPage: true });
      throw error;
    }
  }
}
