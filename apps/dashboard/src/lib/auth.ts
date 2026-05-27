import type { AuthResponse, LoginInput, RegisterInput, AuthUser } from '@ai-job-applier/shared';
import { api } from '@/lib/api';
import { clearAccessToken, setAccessToken } from '@/lib/auth-storage';

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', input);
  setAccessToken(data.accessToken);
  return data;
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', input);
  setAccessToken(data.accessToken);
  return data;
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>('/auth/me');
  return data;
}

export function logout(): void {
  clearAccessToken();
}
