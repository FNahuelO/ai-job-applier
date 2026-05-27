import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { RequestHandler } from 'express';
import { createNestApp } from '../apps/api/src/bootstrap';

let expressHandler: RequestHandler | undefined;

function stripApiPrefixFromRequest(req: VercelRequest): void {
  const url = req.url ?? '/';

  if (url === '/api') {
    req.url = '/';
    return;
  }

  if (url.startsWith('/api/')) {
    req.url = url.slice(4) || '/';
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  stripApiPrefixFromRequest(req);

  if (!expressHandler) {
    const app = await createNestApp();
    expressHandler = app.getHttpAdapter().getInstance() as RequestHandler;
  }

  await new Promise<void>((resolve, reject) => {
    expressHandler!(req as never, res as never, (error?: unknown) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
