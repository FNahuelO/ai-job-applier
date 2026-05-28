import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getDashboardMetrics, type DashboardMetric } from '@/lib/dashboard';

export function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMetrics(): Promise<void> {
      try {
        const data = await getDashboardMetrics();
        if (!cancelled) {
          setMetrics(data);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError('No se pudieron cargar las métricas.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadMetrics();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <p className="text-sm text-slate-400">{metric.label}</p>
            <div className="mt-3 flex items-end justify-between">
              <span className="text-4xl font-semibold text-white">{metric.value}</span>
              <Badge className="bg-violet-500/15 text-violet-200">{metric.trend}</Badge>
            </div>
          </Card>
        ))}
        {isLoading ? <p className="text-sm text-slate-400">Cargando métricas...</p> : null}
        {!isLoading && metrics.length === 0 ? (
          <p className="text-sm text-slate-400">Todavía no hay métricas disponibles.</p>
        ) : null}
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      </section>

      <Card>
        <p className="text-sm text-slate-400">Resumen operativo</p>
        <h3 className="mt-3 text-2xl font-semibold text-white">
          Pipeline de postulaciones con IA listo
        </h3>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          El dashboard centraliza descubrimiento de jobs, priorización con IA, estado de
          aplicaciones y logs del worker para operar de forma segura y medible.
        </p>
        <div className="mt-6 grid gap-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <span className="text-sm text-slate-400">LinkedIn Anti-Ban</span>
            <p className="mt-2 text-lg font-medium text-white">Delays + sesión persistente</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <span className="text-sm text-slate-400">IA Operativa</span>
            <p className="mt-2 text-lg font-medium text-white">Templates y respuestas ATS</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
