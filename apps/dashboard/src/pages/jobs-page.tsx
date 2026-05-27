import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { jobs } from '@/data/mock';
import { getWorkerSettings, updateWorkerSettings } from '@/lib/settings';

export function JobsPage() {
  const [jobSearchTitle, setJobSearchTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings(): Promise<void> {
      try {
        const settings = await getWorkerSettings();
        if (!cancelled) {
          setJobSearchTitle(settings.jobSearchTitle);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError('No se pudo cargar la configuración de búsqueda.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

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

  return (
    <div className="grid gap-6">
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
            <p className="text-sm text-slate-400">Filtrado por React, TypeScript, Node.js y remoto.</p>
          </div>
          <Input className="max-w-xs" placeholder="Buscar por empresa o stack..." />
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
              {jobs.map((job) => (
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
            </TBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
