import { useState, useEffect, useTransition } from 'react';
import { Eye, EyeOff, Lock, CheckCircle2, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { validateResetTokenUseCase, resetPasswordUseCase } from '../di/container';
import { AuthBrandMark } from './components/AuthBrandMark';

type StrengthLevel = { level: 0 | 1 | 2 | 3 | 4; label: string; color: string };

function getPasswordStrength(password: string): StrengthLevel {
  if (password.length === 0) return { level: 0, label: '', color: '' };
  if (password.length < 6)   return { level: 1, label: 'Muy débil',  color: '#EF4444' };
  if (password.length < 8)   return { level: 2, label: 'Débil',      color: '#F59E0B' };
  const hasUpper   = /[A-Z]/.test(password);
  const hasNumber  = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const bonuses    = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  if (bonuses === 3 && password.length >= 10) return { level: 4, label: 'Muy segura', color: '#C8B273' };
  if (bonuses >= 2)                           return { level: 3, label: 'Segura',     color: '#10B981' };
  return { level: 2, label: 'Regular', color: '#F59E0B' };
}

type PageState = 'validating' | 'ready' | 'invalid' | 'done';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [pageState, setPageState]           = useState<PageState>(token ? 'validating' : 'invalid');
  const [validatedEmail, setValidatedEmail] = useState('');
  const [form, setForm]   = useState({ password: '', confirmPassword: '' });
  const [show, setShow]   = useState({ password: false, confirm: false });
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const strength = getPasswordStrength(form.password);

  useEffect(() => {
    if (!token) return;

    let active = true;
    const validate = async () => {
      const email = await validateResetTokenUseCase.execute(token);
      if (!active) return;

      if (email) {
        setValidatedEmail(email);
        setPageState('ready');
        return;
      }

      setPageState('invalid');
      toast.error('Enlace invalido o expirado');
    };

    void validate();

    return () => {
      active = false;
    };
  }, [token]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Las contraseñas no coinciden'); return; }
    setError('');
    startTransition(async () => {
      const success = await resetPasswordUseCase.execute(validatedEmail, form.password, form.confirmPassword);
      if (success) {
        toast.success('Contrasena restablecida');
        setPageState('done');
        return;
      }

      toast.error('No fue posible restablecer la contrasena');
    });
  };

  const confirmInputClass =
    'w-full px-4 py-3 pr-11 bg-[#FAF8F5] border rounded-lg text-[#1C1917] text-sm ' +
    'placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 disabled:opacity-50 ' +
    'disabled:cursor-not-allowed transition-all duration-200 ' +
    (error
      ? 'border-red-300 focus:ring-red-200/50 focus:border-red-400'
      : 'border-[#C8B273]/25 focus:ring-[#C8B273]/30 focus:border-[#C8B273]/70');

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-4 py-16">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C8B273] to-transparent" />
      <AuthBrandMark />

      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-2xl border border-[#C8B273]/20 shadow-sm shadow-[#C8B273]/5 overflow-hidden">
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#C8B273]/60 to-transparent" />
          <div className="p-8">

            {pageState === 'validating' && (
              <div className="text-center py-6">
                <Loader2 className="w-8 h-8 text-[#C8B273] animate-spin mx-auto mb-4" />
                <p className="text-[#78716C] text-sm">Verificando enlace…</p>
              </div>
            )}

            {pageState === 'invalid' && (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-[#1C1917] mb-2">Enlace inválido o expirado</h3>
                <p className="text-[#78716C] text-sm leading-relaxed mb-6">
                  Este enlace no es válido o ya expiró. Los enlaces tienen una vigencia de 15 minutos.
                </p>
                <Link to="/forgot-password" className="inline-flex items-center gap-2 py-2.5 px-6 bg-[#C8B273] hover:bg-[#B8A263] text-[#1C1917] font-semibold rounded-lg transition-all text-sm">
                  Solicitar nuevo enlace
                </Link>
              </div>
            )}

            {pageState === 'ready' && (
              <>
                <div className="mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#C8B273]/10 flex items-center justify-center mb-4">
                    <Lock className="w-5 h-5 text-[#C8B273]" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#1C1917] tracking-tight">Nueva contraseña</h2>
                  <p className="text-[#78716C] text-sm mt-2 leading-relaxed">Elige una contraseña segura para proteger tu cuenta.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#44403C] mb-1.5">Nueva contraseña</label>
                    <div className="relative">
                      <input
                        type={show.password ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isPending}
                        className="w-full px-4 py-3 pr-11 bg-[#FAF8F5] border border-[#C8B273]/25 rounded-lg text-[#1C1917] text-sm placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#C8B273]/30 focus:border-[#C8B273]/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        required
                      />
                      <button type="button" onClick={() => setShow(s => ({ ...s, password: !s.password }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#C8B273] transition-colors"
                        aria-label={show.password ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                        {show.password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.password.length > 0 && (
                      <div className="mt-2.5">
                        <div className="flex gap-1">
                          {([1, 2, 3, 4] as const).map(n => (
                            <div key={n} className="flex-1 h-1 rounded-full transition-all duration-300"
                              style={{ backgroundColor: strength.level >= n ? strength.color : '#E7E5E4' }} />
                          ))}
                        </div>
                        <p className="text-xs mt-1.5 font-medium" style={{ color: strength.color }}>{strength.label}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#44403C] mb-1.5">Confirmar contraseña</label>
                    <div className="relative">
                      <input
                        type={show.confirm ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={e => { setForm(f => ({ ...f, confirmPassword: e.target.value })); if (error) setError(''); }}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isPending}
                        className={confirmInputClass}
                        required
                      />
                      <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#C8B273] transition-colors"
                        aria-label={show.confirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                        {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
                  </div>

                  <button type="submit" disabled={isPending}
                    className="w-full py-3 px-4 bg-[#C8B273] hover:bg-[#B8A263] active:bg-[#A89968] disabled:opacity-60 disabled:cursor-not-allowed text-[#1C1917] font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm tracking-wide mt-1">
                    {isPending
                      ? <div className="w-4 h-4 border-2 border-[#1C1917]/25 border-t-[#1C1917] rounded-full animate-spin" />
                      : 'Restablecer contraseña'
                    }
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-[#C8B273]/15">
                  <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-[#78716C] hover:text-[#C8B273] transition-colors duration-200">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Volver al inicio de sesión
                  </Link>
                </div>
              </>
            )}

            {pageState === 'done' && (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-[#C8B273]/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6 text-[#C8B273]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1C1917] mb-2">Contraseña actualizada</h3>
                <p className="text-[#78716C] text-sm leading-relaxed mb-6">
                  Tu contraseña fue restablecida y todas tus sesiones activas fueron cerradas.
                </p>
                <Link to="/login" className="inline-flex items-center gap-2 py-2.5 px-6 bg-[#C8B273] hover:bg-[#B8A263] text-[#1C1917] font-semibold rounded-lg transition-all text-sm">
                  Ir al inicio de sesión
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
