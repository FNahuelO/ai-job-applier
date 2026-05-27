import { BarChart3, Briefcase, Bot, LogOut, MoonStar, Settings2, Sparkles } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

const links = [
  { to: '/', label: 'Dashboard', icon: Sparkles },
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/applications', label: 'Postulaciones', icon: LogOut },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/ai-settings', label: 'IA', icon: Bot },
  { to: '/worker-logs', label: 'Logs Worker', icon: Settings2 }
];

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout(): void {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-violet-300">AI Job Applier</p>
            <h1 className="mt-3 text-2xl font-semibold text-white">Automation Console</h1>
            <p className="mt-2 text-sm text-slate-400">
              Flujo profesional para busqueda, IA y postulaciones automáticas.
            </p>
          </div>

          <nav className="space-y-2">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white',
                    isActive && 'bg-white/10 text-white'
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
              <MoonStar className="h-4 w-4" />
              Dark Mode Ready
            </div>
            <p className="text-sm text-slate-300">
              UI inspirada en Linear, Vercel y Supabase desde el primer release.
            </p>
            <Button className="mt-4 w-full" variant="secondary">
              Configurar tema
            </Button>
          </div>
        </aside>

        <main className="space-y-6">
          <header className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:flex-row md:items-center">
            <div>
              <p className="text-sm text-slate-400">Sistema listo para fases 2 a 12</p>
              <h2 className="text-3xl font-semibold text-white">Control centralizado</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">{user?.email}</span>
              <Button variant="secondary" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
