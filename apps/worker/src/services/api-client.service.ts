import type { BrowserContextOptions } from 'playwright';
import { getWorkerEnvironment } from '../config/env.js';

type SessionStorageState = Exclude<BrowserContextOptions['storageState'], string | undefined>;

export interface PendingLinkedInConnect {
  connectId: string;
  token: string;
  userId: string;
}

export interface ActiveWorkerUser {
  userId: string;
  email: string;
  jobSearchTitle: string;
}

export class ApiClientService {
  private readonly baseUrl: string;
  private readonly workerSecret: string;

  constructor() {
    const env = getWorkerEnvironment(process.env);
    this.baseUrl = env.apiBaseUrl.replace(/\/$/, '');
    this.workerSecret = env.workerApiSecret;
  }

  async getPendingLinkedInConnects(): Promise<PendingLinkedInConnect[]> {
    return this.request<PendingLinkedInConnect[]>('/worker/linkedin/pending');
  }

  async completeLinkedInConnect(
    connectId: string,
    storageState: SessionStorageState
  ): Promise<void> {
    await this.request(`/worker/linkedin/${connectId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ storageState })
    });
  }

  async failLinkedInConnect(connectId: string, error: string): Promise<void> {
    await this.request(`/worker/linkedin/${connectId}/fail`, {
      method: 'POST',
      body: JSON.stringify({ error })
    });
  }

  async getActiveUsers(): Promise<ActiveWorkerUser[]> {
    return this.request<ActiveWorkerUser[]>('/worker/users/active');
  }

  async getUserLinkedInSession(userId: string): Promise<SessionStorageState> {
    return this.request<SessionStorageState>(`/worker/users/${userId}/linkedin-session`);
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'X-Worker-Secret': this.workerSecret,
        ...(init?.headers ?? {})
      }
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`API ${path} falló (${response.status}): ${message}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const rawBody = await response.text();

    if (!rawBody.trim()) {
      return undefined as T;
    }

    return JSON.parse(rawBody) as T;
  }
}
