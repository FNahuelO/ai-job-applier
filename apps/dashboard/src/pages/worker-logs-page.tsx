import { Card } from '@/components/ui/card';
import { workerLogs } from '@/data/mock';

export function WorkerLogsPage() {
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
      </div>
    </Card>
  );
}
