import { Card } from '@/components/ui/card';

export function AnalyticsPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <p className="text-sm text-slate-400">Analytics de embudo</p>
        <h3 className="mt-3 text-2xl font-semibold text-white">Aplicaciones por día</h3>
        <div className="mt-6 h-64 rounded-2xl border border-dashed border-white/10 bg-black/20" />
      </Card>
      <Card>
        <p className="text-sm text-slate-400">Insights de mercado</p>
        <h3 className="mt-3 text-2xl font-semibold text-white">Tecnologías más demandadas</h3>
        <div className="mt-6 h-64 rounded-2xl border border-dashed border-white/10 bg-black/20" />
      </Card>
    </div>
  );
}
