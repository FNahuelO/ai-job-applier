import axios from 'axios';
import { clearAccessToken, getAccessToken } from '@/lib/auth-storage';

function resolveApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_URL?.trim();

  if (configured) {
    if (configured.startsWith('/')) {
      return configured.replace(/\/$/, '') || '/api';
    }

    if (configured.startsWith('http://') || configured.startsWith('https://')) {
      return configured.replace(/\/$/, '');
    }
  }

  return import.meta.env.DEV ? 'http://localhost:3000/api' : '/api';
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAccessToken();
    }

    return Promise.reject(error);
  }
);
