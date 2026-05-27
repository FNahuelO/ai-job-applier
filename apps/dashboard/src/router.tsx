import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/components/protected-route';
import { AppShell } from '@/layouts/app-shell';
import { AiSettingsPage } from '@/pages/ai-settings-page';
import { AnalyticsPage } from '@/pages/analytics-page';
import { ApplicationsPage } from '@/pages/applications-page';
import { DashboardPage } from '@/pages/dashboard-page';
import { JobsPage } from '@/pages/jobs-page';
import { LoginPage } from '@/pages/login-page';
import { WorkerLogsPage } from '@/pages/worker-logs-page';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <DashboardPage />
          },
          {
            path: 'jobs',
            element: <JobsPage />
          },
          {
            path: 'applications',
            element: <ApplicationsPage />
          },
          {
            path: 'analytics',
            element: <AnalyticsPage />
          },
          {
            path: 'ai-settings',
            element: <AiSettingsPage />
          },
          {
            path: 'worker-logs',
            element: <WorkerLogsPage />
          }
        ]
      }
    ]
  }
]);
