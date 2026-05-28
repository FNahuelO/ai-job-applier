import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { Locator, Page } from 'playwright';
import { getWorkerEnvironment } from '../config/env.js';
import { randomDelay } from '../utils/humanize.js';

export interface ApplyAttemptResult {
  applied: boolean;
  reason: string;
}

export class ApplyService {
  private async findEasyApplyButton(page: Page): Promise<Locator | null> {
    const candidates: Locator[] = [
      page.locator('button.jobs-apply-button'),
      page.locator('.jobs-apply-button--top-card button'),
      page.locator('button[aria-label*="Solicitud sencilla" i]'),
      page.locator('button[aria-label*="Easy Apply" i]'),
      page.getByRole('button', { name: /solicitud sencilla|easy apply|aplicaci[oó]n sencilla/i })
    ];

    for (const candidate of candidates) {
      const button = candidate.first();
      const visible = await button.isVisible({ timeout: 2500 }).catch(() => false);
      if (!visible) {
        continue;
      }

      const label =
        (await button.getAttribute('aria-label').catch(() => null)) ??
        (await button.textContent().catch(() => '')) ??
        '';
      const normalized = label.trim().toLowerCase();

      // "Solicitar" sin "sencilla" suele ser postulación externa.
      if (normalized === 'solicitar' || normalized === 'apply') {
        continue;
      }

      return button;
    }

    return null;
  }

  async attemptEasyApply(page: Page): Promise<ApplyAttemptResult> {
    const env = getWorkerEnvironment(process.env);
    await mkdir(env.screenshotsDir, { recursive: true });

    try {
      await randomDelay(1200, 2200);

      const easyApplyButton = await this.findEasyApplyButton(page);
      if (!easyApplyButton) {
        const hasExternalApply = await page
          .getByRole('button', { name: /^solicitar$|^apply$/i })
          .first()
          .isVisible({ timeout: 1500 })
          .catch(() => false);

        return {
          applied: false,
          reason: hasExternalApply
            ? 'Solo postulación externa (sin Easy Apply).'
            : 'No se encontró botón de Easy Apply en el aviso.'
        };
      }

      await easyApplyButton.click();
      await randomDelay();

      const textarea = page.locator('textarea').first();
      if (await textarea.isVisible({ timeout: 3000 }).catch(() => false)) {
        await textarea.fill(
          'Tengo experiencia sólida construyendo aplicaciones con React, TypeScript y Node.js.'
        );
        await randomDelay();
      }

      for (let step = 0; step < 4; step += 1) {
        const submitButton = page
          .getByRole('button', {
            name: /submit application|send application|enviar solicitud|enviar/i
          })
          .first();
        if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await submitButton.click();
          await randomDelay(1800, 3200);
          return { applied: true, reason: 'Solicitud enviada.' };
        }

        const nextButton = page
          .getByRole('button', { name: /next|review|continue|siguiente|revisar/i })
          .first();
        if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nextButton.click();
          await randomDelay();
          continue;
        }

        break;
      }

      return { applied: false, reason: 'Se abrió Easy Apply pero no se pudo completar el formulario.' };
    } catch (error) {
      const filename = path.join(env.screenshotsDir, `apply-error-${Date.now()}.png`);
      await page.screenshot({ path: filename, fullPage: true }).catch(() => undefined);
      const message = error instanceof Error ? error.message : 'Error desconocido';
      return { applied: false, reason: message };
    }
  }
}
