import type {
  LinkedInAccountStatus,
  LinkedInConnectStartResponse,
  LinkedInConnectStatusResponse
} from '@ai-job-applier/shared';
import { api } from '@/lib/api';

export async function getLinkedInStatus(): Promise<LinkedInAccountStatus> {
  const { data } = await api.get<LinkedInAccountStatus>('/linkedin/status');
  return data;
}

export async function startLinkedInConnect(): Promise<LinkedInConnectStartResponse> {
  const { data } = await api.post<LinkedInConnectStartResponse>('/linkedin/connect');
  return data;
}

export async function getLinkedInConnectStatus(
  token: string
): Promise<LinkedInConnectStatusResponse> {
  const { data } = await api.get<LinkedInConnectStatusResponse>(`/linkedin/connect/${token}/status`);
  return data;
}

export async function disconnectLinkedIn(): Promise<LinkedInAccountStatus> {
  const { data } = await api.delete<LinkedInAccountStatus>('/linkedin/disconnect');
  return data;
}
