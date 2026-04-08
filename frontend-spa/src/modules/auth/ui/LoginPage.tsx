import { useState, useTransition } from 'react';
import { Sparkles, Eye, EyeOff, LogIn } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { getHomePathByRole } from '@/router/role-home';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [isPending, startTransition] = useTransition();

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
  const fromLandingAdmin = Boolean((location.state as { fromLandingAdmin?: boolean } | null)?.fromLandingAdmin);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const authenticatedUser = await login({ username: form.username, password: form.password });
      if (!authenticatedUser) {
        toast.error('Credenciales incorrectas', {
          description: 'Verifica tu usuario y contraseña para continuar.',
        });
        return;
      }

      toast.success('Sesion iniciada');

      const targetPath = from ?? getHomePathByRole(authenticatedUser.role);
      void navigate(targetPath, { replace: true });
    });
  };

  return (
    <div className={`min-h-screen flex ${fromLandingAdmin ? 'login-enter-from-landing' : ''}`}>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#1C1917] relative overflow-hidden flex-col items-center justify-center px-16">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #C8B273 1px, transparent 0)', backgroundSize: '28px 28px' }}
        />
        <div className="absolute right-0 inset-y-0 w-px bg-gradient-to-b from-transparent via-[#C8B273] to-transparent opacity-60" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full border border-[#C8B273]/10" />
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full border border-[#C8B273]/10" />

        <div className="relative z-10 text-center select-none">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-14 h-14 rounded-full border border-[#C8B273]/30 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-[#C8B273]" />
            </div>
          </div>
          <h1 className="text-6xl font-bold tracking-tight mb-1">
            <span className="bg-gradient-to-br from-[#E8DCC8] via-[#C8B273] to-[#A89968] bg-clip-text text-transparent">Alory</span>
          </h1>
          <h2 className="text-2xl font-light text-white/60 tracking-[0.15em] mb-6">COSMETOLOGY</h2>
          <div className="flex items-center gap-3 justify-center mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C8B273]/40" />
            <span className="text-[#C8B273]/50 text-xs tracking-[0.3em] uppercase">Since 2011</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#C8B273]/40" />
          </div>
          <p className="text-white/30 text-xs tracking-[0.25em] uppercase">Panel de Administración</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-[#FAF8F5] px-8 py-16">
        <div className="absolute top-0 left-0 right-0 lg:hidden h-0.5 bg-gradient-to-r from-transparent via-[#C8B273] to-transparent" />
        <div className="w-full max-w-[400px]">

          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <Sparkles className="w-6 h-6 text-[#C8B273]" />
            <span className="text-xl font-bold text-[#1C1917]">
              Alory <span className="font-light text-[#78716C]">Cosmetology</span>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[#1C1917] tracking-tight">Bienvenido de vuelta</h2>
            <p className="text-[#78716C] text-sm mt-1.5">Ingresa tus credenciales para acceder al panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#44403C] mb-1.5">Usuario</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="Ingresa tu usuario"
                autoComplete="username"
                disabled={isPending}
                className="w-full px-4 py-3 bg-white border border-[#C8B273]/25 rounded-lg text-[#1C1917] text-sm placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#C8B273]/30 focus:border-[#C8B273]/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#44403C] mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isPending}
                  className="w-full px-4 py-3 pr-11 bg-white border border-[#C8B273]/25 rounded-lg text-[#1C1917] text-sm placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#C8B273]/30 focus:border-[#C8B273]/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#C8B273] transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end -mt-1">
              <Link to="/forgot-password" className="text-sm text-[#C8B273] hover:text-[#A89968] transition-colors font-medium">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 bg-[#C8B273] hover:bg-[#B8A263] active:bg-[#A89968] disabled:opacity-60 disabled:cursor-not-allowed text-[#1C1917] font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm tracking-wide mt-1"
            >
              {isPending
                ? <div className="w-4 h-4 border-2 border-[#1C1917]/25 border-t-[#1C1917] rounded-full animate-spin" />
                : <><LogIn className="w-4 h-4" />Iniciar Sesión</>
              }
            </button>
          </form>

          <p className="text-center text-[#A8A29E] text-xs mt-10">
            © {new Date().getFullYear()} Alory Cosmetology · Sistema de gestión interno
          </p>
        </div>
      </div>
    </div>
  );
}
