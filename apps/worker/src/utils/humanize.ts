import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { Mouse, Page } from 'playwright';

export async function randomDelay(minMs = 900, maxMs = 2600): Promise<void> {
  const wait = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  await new Promise((resolve) => setTimeout(resolve, wait));
}

export async function humanMoveMouse(mouse: Mouse, x: number, y: number): Promise<void> {
  const steps = Math.floor(Math.random() * 10) + 12;
  await mouse.move(x, y, { steps });
}

export async function humanScroll(page: Page): Promise<void> {
  const distance = Math.floor(Math.random() * 700) + 250;
  await page.mouse.wheel(0, distance);
  await randomDelay(600, 1400);
}

export async function ensureDirectory(filePath: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
}
