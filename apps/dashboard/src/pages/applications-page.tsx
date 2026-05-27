import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { applications } from '@/data/mock';

export function ApplicationsPage() {
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
          </TBody>
        </Table>
      </div>
    </Card>
  );
}
