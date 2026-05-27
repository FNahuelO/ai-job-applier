import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function AiSettingsPage() {
  return (
    <Card className="max-w-3xl">
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-white">Configuración IA</h3>
        <p className="text-sm text-slate-400">
          Preparado para prompts reutilizables, templates y generación contextual.
        </p>
      </div>
      <div className="grid gap-4">
        <Input defaultValue="gpt-4.1-mini" />
        <Input defaultValue="Describe your React experience" />
        <textarea
          className="min-h-40 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          defaultValue="Respuesta automática profesional basada en experiencia Full Stack."
        />
        <Button className="w-fit">Guardar templates</Button>
      </div>
    </Card>
  );
}
