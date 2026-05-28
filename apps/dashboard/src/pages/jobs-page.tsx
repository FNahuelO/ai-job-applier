import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { getDashboardJobs, type DashboardJob } from '@/lib/dashboard';
import {
  disconnectLinkedIn,
  getLinkedInConnectStatus,
  getLinkedInStatus,
  startLinkedInConnect
} from '@/lib/linkedin';
import { getWorkerSettings, updateWorkerSettings } from '@/lib/settings';

export function JobsPage() {
  const [jobs, setJobs] = useState<DashboardJob[]>([]);
  const [jobsQuery, setJobsQuery] = useState('');
  const [jobSearchTitle, setJobSearchTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [linkedinConnectedAt, setLinkedinConnectedAt] = useState<string | undefined>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectMessage, setConnectMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings(): Promise<void> {
      try {
        const [settings, linkedinStatus, jobsData] = await Promise.all([
          getWorkerSettings(),
          getLinkedInStatus(),
          getDashboardJobs()
        ]);
        if (!cancelled) {
          setJobSearchTitle(settings.jobSearchTitle);
          setLinkedinConnected(linkedinStatus.connected);
          setLinkedinConnectedAt(linkedinStatus.connectedAt);
          setJobs(jobsData);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError('No se pudo cargar la configuración.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsLoadingJobs(false);
        }
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleConnectLinkedIn(): Promise<void> {
    setIsConnecting(true);
    setConnectMessage(null);
    setError(null);

    try {
      const connect = await startLinkedInConnect();
      setConnectMessage(
        'Se abrirá LinkedIn en tu máquina (worker). Completá el login en la ventana del navegador.'
      );

      const pollUntil = Date.now() + 12 * 60 * 1000;

      while (Date.now() < pollUntil) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const status = await getLinkedInConnectStatus(connect.token);

        if (status.status === 'completed') {
          setLinkedinConnected(true);
          setLinkedinConnectedAt(status.connectedAt);
          setConnectMessage('LinkedIn conectado correctamente.');
          return;
        }

        if (status.status === 'failed') {
          setConnectMessage(status.error ?? 'No se pudo conectar LinkedIn.');
          return;
        }

        if (status.status === 'expired') {
          setConnectMessage('La solicitud expiró. Intentá de nuevo.');
          return;
        }
      }

      setConnectMessage('Tiempo de espera agotado. Verificá que el worker esté corriendo.');
    } catch {
      setConnectMessage('No se pudo iniciar la conexión con LinkedIn.');
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleDisconnectLinkedIn(): Promise<void> {
    try {
      const status = await disconnectLinkedIn();
      setLinkedinConnected(status.connected);
      setLinkedinConnectedAt(status.connectedAt);
      setConnectMessage('Cuenta de LinkedIn desconectada.');
    } catch {
      setConnectMessage('No se pudo desconectar LinkedIn.');
    }
  }

  async function handleSave(): Promise<void> {
    setIsSaving(true);
    setSaved(false);
    setError(null);

    try {
      const settings = await updateWorkerSettings({ jobSearchTitle });
      setJobSearchTitle(settings.jobSearchTitle);
      setSaved(true);
    } catch {
      setError('No se pudo guardar. Revisá que la API esté en marcha.');
    } finally {
      setIsSaving(false);
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const haystack = `${job.title} ${job.company} ${job.technologies.join(' ')}`.toLowerCase();
    return haystack.includes(jobsQuery.trim().toLowerCase());
  });

  return (
    <div className="grid gap-6">
      <Card className="max-w-3xl">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">Cuenta de LinkedIn</h3>
            <p className="text-sm text-slate-400">
              Cada usuario conecta su propia cuenta. No guardamos tu contraseña de LinkedIn.
            </p>
          </div>
          <Badge
            className={
              linkedinConnected
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'bg-amber-500/15 text-amber-200'
            }
          >
            {linkedinConnected ? 'Conectado' : 'Sin conectar'}
          </Badge>
        </div>
        {linkedinConnectedAt ? (
          <p className="mb-4 text-xs text-slate-500">
            Conectado: {new Date(linkedinConnectedAt).toLocaleString()}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button disabled={isConnecting || linkedinConnected} onClick={() => void handleConnectLinkedIn()}>
            {isConnecting ? 'Conectando...' : 'Conectar LinkedIn'}
          </Button>
          {linkedinConnected ? (
            <Button variant="secondary" onClick={() => void handleDisconnectLinkedIn()}>
              Desconectar
            </Button>
          ) : null}
        </div>
        {connectMessage ? <p className="mt-3 text-sm text-slate-300">{connectMessage}</p> : null}
        <p className="mt-3 text-xs text-slate-500">
          Requisito: el worker debe estar activo en tu máquina (`ai-job-worker.service`) con{' '}
          <code className="text-violet-300">PLAYWRIGHT_HEADLESS=false</code>.
        </p>
      </Card>

      <Card className="max-w-3xl">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white">Búsqueda en LinkedIn</h3>
          <p className="text-sm text-slate-400">
            El worker usa este título en cada ejecución. Si lo dejás vacío, aplica los filtros
            por defecto del proyecto.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-sm text-slate-400" htmlFor="job-search-title">
              Título del puesto
            </label>
            <Input
              id="job-search-title"
              placeholder="Ej: Backend Developer, Data Analyst..."
              value={jobSearchTitle}
              disabled={isLoading || isSaving}
              onChange={(event) => {
                setJobSearchTitle(event.target.value);
                setSaved(false);
              }}
            />
          </div>
          <Button
            className="w-fit shrink-0"
            disabled={isLoading || isSaving}
            onClick={() => void handleSave()}
          >
            {isSaving ? 'Guardando...' : 'Guardar búsqueda'}
          </Button>
        </div>
        {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
        {saved ? (
          <p className="mt-3 text-sm text-emerald-400">
            Guardado. El worker lo tomará en la próxima ejecución.
          </p>
        ) : null}
      </Card>

      <Card>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-white">Jobs encontrados</h3>
            <p className="text-sm text-slate-400">Datos reales sincronizados desde la API.</p>
          </div>
          <Input
            className="max-w-xs"
            placeholder="Buscar por empresa o stack..."
            value={jobsQuery}
            onChange={(event) => setJobsQuery(event.target.value)}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <Table>
            <THead>
              <TR>
                <TH>Posición</TH>
                <TH>Empresa</TH>
                <TH>Senioridad</TH>
                <TH>Tecnologías</TH>
                <TH>Estado</TH>
              </TR>
            </THead>
            <TBody>
              {filteredJobs.map((job) => (
                <TR key={job.id}>
                  <TD>
                    <div className="font-medium text-white">{job.title}</div>
                    <div className="text-xs text-slate-500">{job.location}</div>
                  </TD>
                  <TD>{job.company}</TD>
                  <TD>{job.seniority}</TD>
                  <TD>
                    <div className="flex flex-wrap gap-2">
                      {job.technologies.map((tech) => (
                        <Badge key={tech}>{tech}</Badge>
                      ))}
                    </div>
                  </TD>
                  <TD>
                    <Badge className="bg-violet-500/15 text-violet-200">{job.status}</Badge>
                  </TD>
                </TR>
              ))}
              {!isLoadingJobs && filteredJobs.length === 0 ? (
                <TR>
                  <TD colSpan={5}>No hay jobs para mostrar.</TD>
                </TR>
              ) : null}
            </TBody>
          </Table>
        </div>
        {isLoadingJobs ? <p className="mt-4 text-sm text-slate-400">Cargando jobs...</p> : null}
      </Card>
    </div>
  );
}
