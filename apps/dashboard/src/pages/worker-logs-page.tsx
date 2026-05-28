import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { getDashboardWorkerLogs } from '@/lib/dashboard';

export function WorkerLogsPage() {
  const [workerLogs, setWorkerLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLogs(): Promise<void> {
      try {
        const data = await getDashboardWorkerLogs();
        if (!cancelled) {
          setWorkerLogs(data);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError('No se pudieron cargar los logs.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadLogs();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-white">Logs del worker</h3>
        <p className="text-sm text-slate-400">
          Trazabilidad operativa para Playwright, sesión y errores.
        </p>
      </div>
      <div className="space-y-3">
        {workerLogs.map((log) => (
          <div
            key={log}
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm text-slate-300"
          >
            {log}
          </div>
        ))}
        {!isLoading && workerLogs.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-400">
            Todavía no hay eventos de worker para mostrar.
          </div>
        ) : null}
      </div>
      {isLoading ? <p className="mt-4 text-sm text-slate-400">Cargando logs...</p> : null}
      {error ? <p className="mt-4 text-sm text-rose-400">{error}</p> : null}
    </Card>
  );
}
