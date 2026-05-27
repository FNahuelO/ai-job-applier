import type { UpdateWorkerSettingsInput, WorkerSettings } from '@ai-job-applier/shared';
import { api } from '@/lib/api';

export async function getWorkerSettings(): Promise<WorkerSettings> {
  const { data } = await api.get<WorkerSettings>('/settings');
  return data;
}

export async function updateWorkerSettings(
  input: UpdateWorkerSettingsInput
): Promise<WorkerSettings> {
  const { data } = await api.patch<WorkerSettings>('/settings', input);
  return data;
}
