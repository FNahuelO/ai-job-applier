import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { Locator, Page } from 'playwright';
import { getWorkerEnvironment } from '../config/env.js';
import { randomDelay } from '../utils/humanize.js';

export interface ApplyAttemptResult {
  applied: boolean;
  reason: string;
}

const EXTERNAL_APPLY_PATTERN =
  /sitio web de la empresa|company website|employer.?s website|en el sitio web|offsite|externo|external/i;

export class ApplyService {
  private async isExternalApplyButton(button: Locator): Promise<boolean> {
    const ariaLabel = (await button.getAttribute('aria-label').catch(() => '')) ?? '';
    const text = (await button.textContent().catch(() => '')) ?? '';
    const className = (await button.getAttribute('class').catch(() => '')) ?? '';
    const combined = `${ariaLabel} ${text} ${className}`;

    if (EXTERNAL_APPLY_PATTERN.test(combined)) {
      return true;
    }

    if (className.includes('jobs-apply-button--offline')) {
      return true;
    }

    return false;
  }

  private async findEasyApplyButton(page: Page): Promise<Locator | null> {
    const containerSelectors = [
      'button.jobs-apply-button:not(.jobs-apply-button--offline)',
      '.jobs-s-apply button.artdeco-button--primary',
      '.jobs-details-jobs-unified-top-card__container--two-pane button.jobs-apply-button'
    ];

    for (const selector of containerSelectors) {
      const button = page.locator(selector).first();
      const visible = await button.isVisible({ timeout: 2500 }).catch(() => false);
      if (!visible) {
        continue;
      }

      if (await this.isExternalApplyButton(button)) {
        continue;
      }

      return button;
    }

    const textCandidates = page.getByRole('button', {
      name: /solicitar|solicitud sencilla|easy apply|aplicaci[oó]n sencilla/i
    });

    const count = await textCandidates.count().catch(() => 0);
    for (let index = 0; index < count; index += 1) {
      const button = textCandidates.nth(index);
      const visible = await button.isVisible({ timeout: 1500 }).catch(() => false);
      if (!visible) {
        continue;
      }

      if (await this.isExternalApplyButton(button)) {
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

      const offlineApply = page.locator(
        '.jobs-apply-button--offline, a[data-control-name*="offsite"], a[data-control-name*="jobdetails_offsite"]'
      );
      if (await offlineApply.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        return { applied: false, reason: 'Postulación externa (sitio del empleador).' };
      }

      const easyApplyButton = await this.findEasyApplyButton(page);
      if (!easyApplyButton) {
        return {
          applied: false,
          reason: 'No se encontró botón de postulación en el aviso.'
        };
      }

      const buttonLabel =
        (await easyApplyButton.getAttribute('aria-label').catch(() => null)) ??
        (await easyApplyButton.textContent().catch(() => '')) ??
        'Solicitar';

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
          return { applied: true, reason: `Solicitud enviada (${buttonLabel.trim()}).` };
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

      return {
        applied: false,
        reason: `Se abrió el flujo (${buttonLabel.trim()}) pero no se completó el envío.`
      };
    } catch (error) {
      const filename = path.join(env.screenshotsDir, `apply-error-${Date.now()}.png`);
      await page.screenshot({ path: filename, fullPage: true }).catch(() => undefined);
      const message = error instanceof Error ? error.message : 'Error desconocido';
      return { applied: false, reason: message };
    }
  }
}
