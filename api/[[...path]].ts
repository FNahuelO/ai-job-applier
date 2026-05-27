import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { RequestHandler } from 'express';
import { createNestApp } from '../apps/api/dist/bootstrap';

let expressHandler: RequestHandler | undefined;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (!expressHandler) {
    const app = await createNestApp();
    expressHandler = app.getHttpAdapter().getInstance() as RequestHandler;
  }

  await new Promise<void>((resolve, reject) => {
    expressHandler!(req, res, (error?: unknown) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
