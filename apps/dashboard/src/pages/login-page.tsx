import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">AI Job Applier</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-slate-400">
            Accedé al dashboard para gestionar búsquedas, postulaciones y generación con IA.
          </p>
        </div>
        <div className="space-y-4">
          <Input placeholder="email@dominio.com" type="email" />
          <Input placeholder="Tu contraseña" type="password" />
          <Button className="w-full">Entrar al dashboard</Button>
        </div>
      </Card>
    </div>
  );
}
