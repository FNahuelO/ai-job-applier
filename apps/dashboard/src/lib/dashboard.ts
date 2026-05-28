import { api } from '@/lib/api';

export interface DashboardMetric {
  label: string;
  value: string;
  trend: string;
}

export interface DashboardJob {
  id: string;
  title: string;
  company: string;
  location: string;
  seniority: string;
  technologies: string[];
  status: string;
}

export interface DashboardApplication {
  company: string;
  role: string;
  status: string;
  date: string;
}

export async function getDashboardMetrics(): Promise<DashboardMetric[]> {
  const { data } = await api.get<DashboardMetric[]>('/dashboard/metrics');
  return data;
}

export async function getDashboardJobs(): Promise<DashboardJob[]> {
  const { data } = await api.get<DashboardJob[]>('/dashboard/jobs');
  return data;
}

export async function getDashboardApplications(): Promise<DashboardApplication[]> {
  const { data } = await api.get<DashboardApplication[]>('/dashboard/applications');
  return data;
}

export async function getDashboardWorkerLogs(): Promise<string[]> {
  const { data } = await api.get<string[]>('/dashboard/worker-logs');
  return data;
}
