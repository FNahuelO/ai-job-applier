export type LinkedInConnectStatus = 'pending' | 'completed' | 'failed' | 'expired';

export interface LinkedInConnectStartResponse {
  connectId: string;
  token: string;
  expiresAt: string;
}

export interface LinkedInConnectStatusResponse {
  status: LinkedInConnectStatus;
  connectedAt?: string;
  error?: string;
}

export interface LinkedInAccountStatus {
  connected: boolean;
  connectedAt?: string;
}
