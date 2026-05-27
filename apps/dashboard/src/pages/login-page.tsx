import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';

export function LoginPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ email, password });
      }
      navigate('/');
    } catch {
      setError('No se pudo completar la autenticación. Revisá tus datos.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">AI Job Applier</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Gestioná búsquedas, conectá tu LinkedIn y automatizá postulaciones.
          </p>
        </div>

        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <Input
            placeholder="email@dominio.com"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            placeholder="Mínimo 8 caracteres"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting
              ? 'Procesando...'
              : mode === 'login'
                ? 'Entrar al dashboard'
                : 'Registrarme'}
          </Button>
        </form>

        <button
          className="text-sm text-violet-300 hover:text-violet-200"
          type="button"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login'
            ? '¿No tenés cuenta? Registrate'
            : '¿Ya tenés cuenta? Iniciá sesión'}
        </button>

        <p className="text-center text-xs text-slate-500">
          Al continuar aceptás usar tu propia cuenta de LinkedIn de forma responsable.
        </p>
        <Link className="sr-only" to="/">
          Dashboard
        </Link>
      </Card>
    </div>
  );
}
