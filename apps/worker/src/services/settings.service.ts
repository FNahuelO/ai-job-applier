import type { WorkerSettings } from '@ai-job-applier/shared';

export async function fetchJobSearchTitle(apiBaseUrl: string): Promise<string> {
  const response = await fetch(`${apiBaseUrl}/settings`);

  if (!response.ok) {
    throw new Error(`No se pudo obtener la configuración (${response.status}).`);
  }

  const data = (await response.json()) as WorkerSettings;
  return data.jobSearchTitle?.trim() ?? '';
}
