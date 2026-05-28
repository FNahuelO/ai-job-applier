import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ApplicationStatus } from '@ai-job-applier/shared';
import { Application } from '../database/models/application.model';
import { Job } from '../database/models/job.model';
import { LinkedInConnectRequest } from '../database/models/linkedin-connect-request.model';

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

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Application)
    private readonly applicationModel: typeof Application,
    @InjectModel(Job)
    private readonly jobModel: typeof Job,
    @InjectModel(LinkedInConnectRequest)
    private readonly linkedInConnectRequestModel: typeof LinkedInConnectRequest
  ) {}

  async getMetrics(userId: string): Promise<DashboardMetric[]> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [applicationsToday, totalApplications, interviewCount, jobsFound] = await Promise.all([
      this.applicationModel.count({
        where: {
          userId,
          createdAt: { [Op.gte]: todayStart }
        }
      }),
      this.applicationModel.count({ where: { userId } }),
      this.applicationModel.count({
        where: {
          userId,
          status: ApplicationStatus.Interview
        }
      }),
      this.jobModel.count()
    ]);

    const interviewRate = totalApplications === 0 ? 0 : (interviewCount / totalApplications) * 100;

    return [
      { label: 'Postulaciones hoy', value: String(applicationsToday), trend: 'en vivo' },
      {
        label: 'Tasa de entrevistas',
        value: `${interviewRate.toFixed(1)}%`,
        trend: `${interviewCount}/${totalApplications || 0}`
      },
      { label: 'Jobs encontrados', value: String(jobsFound), trend: 'base actual' },
      { label: 'Aplicaciones totales', value: String(totalApplications), trend: 'histórico' }
    ];
  }

  async getJobs(): Promise<DashboardJob[]> {
    const jobs = await this.jobModel.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    return jobs.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location ?? 'Sin ubicación',
      seniority: job.seniority ?? 'No definida',
      technologies: job.technologies ?? [],
      status: 'Detectado'
    }));
  }

  async getApplications(userId: string): Promise<DashboardApplication[]> {
    const applications = await this.applicationModel.findAll({
      where: { userId },
      include: [Job],
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    return applications.map((application) => {
      const date = application.appliedAt ?? application.createdAt;
      return {
        company: application.job?.company ?? 'Desconocida',
        role: application.job?.title ?? 'Sin rol',
        status: application.status,
        date: date.toISOString().slice(0, 10)
      };
    });
  }

  async getWorkerLogs(userId: string): Promise<string[]> {
    const events = await this.linkedInConnectRequestModel.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    return events.map((event) => {
      const timestamp = event.createdAt.toISOString().slice(11, 19);
      const status = event.status.toUpperCase();
      const error = event.errorMessage ? ` - ${event.errorMessage}` : '';
      return `[${timestamp}] LinkedIn connect ${status}${error}`;
    });
  }
}
