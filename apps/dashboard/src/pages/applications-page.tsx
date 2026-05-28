import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import {
  getDashboardApplications,
  type DashboardApplication
} from '@/lib/dashboard';

export function ApplicationsPage() {
  const [applications, setApplications] = useState<DashboardApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadApplications(): Promise<void> {
      try {
        const data = await getDashboardApplications();
        if (!cancelled) {
          setApplications(data);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError('No se pudo cargar el historial de postulaciones.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadApplications();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-white">Historial de postulaciones</h3>
        <p className="text-sm text-slate-400">
          Seguimiento centralizado de cada job aplicado y su resultado.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <Table>
          <THead>
            <TR>
              <TH>Empresa</TH>
              <TH>Rol</TH>
              <TH>Estado</TH>
              <TH>Fecha</TH>
            </TR>
          </THead>
          <TBody>
            {applications.map((application) => (
              <TR key={`${application.company}-${application.date}`}>
                <TD>{application.company}</TD>
                <TD>{application.role}</TD>
                <TD>
                  <Badge className="bg-cyan-500/15 text-cyan-200">{application.status}</Badge>
                </TD>
                <TD>{application.date}</TD>
              </TR>
            ))}
            {!isLoading && applications.length === 0 ? (
              <TR>
                <TD colSpan={4}>Todavía no hay postulaciones registradas.</TD>
              </TR>
            ) : null}
          </TBody>
        </Table>
      </div>
      {isLoading ? <p className="mt-4 text-sm text-slate-400">Cargando historial...</p> : null}
      {error ? <p className="mt-4 text-sm text-rose-400">{error}</p> : null}
    </Card>
  );
}
