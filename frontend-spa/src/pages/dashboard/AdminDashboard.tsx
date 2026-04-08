import DashboardLayout from '@/components/Layout/DashboardLayout';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { AlertTriangle, CalendarDays, Package, Users } from 'lucide-react';
import { AxiosError } from 'axios';
import api from '@/api/axios';
import { useAuth } from '@/hooks/useAuth';
import { tokenStorage } from '@/modules/auth/infrastructure/storage/LocalStorageTokenStorage';

interface ApiEnvelope<T> {
  result?: T;
  metadata?: {
    total?: number;
  };
  text?: string;
  message?: string;
}

interface DashboardStats {
  clients: number;
  products: number;
  appointments: number;
}

interface ProductItem {
  id: number;
  name: string;
  quantity: number;
  minimum_stock: number;
  is_active: boolean;
}

type AppointmentStatus = 'PENDING' | 'ACCEPTED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

interface AppointmentItem {
  id: number;
  appointment_date: string;
  status: AppointmentStatus;
  Client?: {
    full_name?: string;
  };
  Service?: {
    name?: string;
  };
}

const EMPTY_STATS: DashboardStats = {
  clients: 0,
  products: 0,
  appointments: 0,
};

const ADMIN_WELCOME_TOAST_ID = 'admin-welcome-toast';
const ADMIN_WELCOME_TOAST_SEEN_PREFIX = 'admin-welcome-toast-seen';

const toMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { text?: string; message?: string } | undefined;
    return data?.text || data?.message || error.message || fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
};

const readCount = (payload: unknown) => {
  const envelope = payload as ApiEnvelope<unknown> | undefined;

  if (envelope?.metadata?.total !== undefined) {
    return Number(envelope.metadata.total) || 0;
  }

  if (Array.isArray(envelope?.result)) {
    return envelope.result.length;
  }

  if (Array.isArray(payload)) {
    return payload.length;
  }

  return 0;
};

const unwrapList = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];

  const envelope = payload as ApiEnvelope<unknown> | undefined;

  if (!envelope?.result) return [];

  if (Array.isArray(envelope.result)) return envelope.result as T[];

  const maybePaginated = envelope.result as { data?: T[] };
  if (Array.isArray(maybePaginated.data)) return maybePaginated.data;

  return [];
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [lowStockProducts, setLowStockProducts] = useState<ProductItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(false);

  const statusLabel: Record<AppointmentStatus, string> = {
    PENDING: 'pendiente',
    ACCEPTED: 'aceptada',
    SCHEDULED: 'aceptada',
    COMPLETED: 'confirmada',
    CANCELLED: 'cancelada',
  };

  const statusClassName: Record<AppointmentStatus, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    ACCEPTED: 'bg-blue-100 text-blue-700',
    SCHEDULED: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-rose-100 text-rose-700',
  };

  const upcomingAppointments = appointments
    .filter((appointment) => ['PENDING', 'ACCEPTED', 'SCHEDULED'].includes(appointment.status))
    .filter((appointment) => new Date(appointment.appointment_date).getTime() >= Date.now())
    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
    .slice(0, 3);

  const recentActivity = [...appointments]
    .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())
    .slice(0, 4);

  const loadStats = async () => {
    try {
      setLoading(true);

      const [clientsRes, productsRes, appointmentsRes] = await Promise.all([
        api.get('clients/getAllClients?page=1&size=1'),
        api.get('products/getAll?page=1&size=200'),
        api.get('appointments/getAll'),
      ]);

      const products = unwrapList<ProductItem>(productsRes.data);
      const appointmentsRows = unwrapList<AppointmentItem>(appointmentsRes.data);
      const lowStock = products
        .filter((product) => product.is_active && Number(product.quantity) <= Number(product.minimum_stock))
        .sort((a, b) => Number(a.quantity) - Number(b.quantity));

      setLowStockProducts(lowStock);
      setAppointments(appointmentsRows);

      setStats({
        clients: readCount(clientsRes.data),
        products: readCount(productsRes.data),
        appointments: readCount(appointmentsRes.data),
      });
    } catch (error) {
      toast.error('No fue posible cargar metricas', {
        description: toMessage(error, 'Verifica sesion y disponibilidad del backend.'),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const sessionToken = tokenStorage.get();
    const welcomeSeenKey = `${ADMIN_WELCOME_TOAST_SEEN_PREFIX}:${sessionToken ?? 'no-token'}`;
    const welcomeWasShown = sessionStorage.getItem(welcomeSeenKey) === '1';
    const displayName = user?.full_name?.trim() || user?.username?.trim();
    const welcomeTitle = displayName ? `Bienvenido, ${displayName}` : 'Bienvenido';

    if (!welcomeWasShown) {
      toast.success(welcomeTitle, {
        description: 'Todo listo para operar',
        id: ADMIN_WELCOME_TOAST_ID,
      });
      sessionStorage.setItem(welcomeSeenKey, '1');
    }

    void loadStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-4 bg-neutral-50 min-h-screen">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">
            Resumen <span className="text-amber-600">General</span>
          </h2>
          <p className="text-sm text-neutral-500">Vista general de Alory Cosmetology</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
          <button
            type="button"
            className="rounded-2xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            onClick={() => toast('Clientes', { description: 'Aqui veras todos tus clientes' })}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs tracking-wide text-neutral-500">TOTAL CLIENTES</p>
                <h3 className="text-2xl font-semibold text-neutral-900">{loading ? '...' : stats.clients}</h3>
              </div>
              <Users className="h-5 w-5 text-amber-600" />
            </div>
          </button>

          <button
            type="button"
            className="rounded-2xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            onClick={() => toast('Inventario', { description: 'Controla tus productos' })}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs tracking-wide text-neutral-500">PRODUCTOS</p>
                <h3 className="text-2xl font-semibold text-neutral-900">{loading ? '...' : stats.products}</h3>
              </div>
              <Package className="h-5 w-5 text-amber-600" />
            </div>
          </button>

          <button
            type="button"
            className="rounded-2xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            onClick={() => toast('Citas', { description: 'Administra tus citas' })}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs tracking-wide text-neutral-500">CITAS</p>
                <h3 className="text-2xl font-semibold text-neutral-900">{loading ? '...' : stats.appointments}</h3>
              </div>
              <CalendarDays className="h-5 w-5 text-amber-600" />
            </div>
          </button>

          <button
            type="button"
            className="rounded-2xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            onClick={() => toast('Inventario', { description: `${lowStockProducts.length} producto(s) con stock bajo` })}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs tracking-wide text-neutral-500">ALERTAS INVENTARIO</p>
                <h3 className="text-2xl font-semibold text-neutral-900">{loading ? '...' : lowStockProducts.length}</h3>
              </div>
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h5 className="mb-3 text-base font-semibold text-neutral-900">Alertas de Inventario</h5>

            {loading ? (
              <p className="text-sm text-neutral-500">Cargando alertas...</p>
            ) : lowStockProducts.length === 0 ? (
              <p className="text-sm text-emerald-700">Todo en orden. No hay productos con stock bajo.</p>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="rounded-xl bg-neutral-50 p-3">
                    <p className="font-semibold text-neutral-900">{product.name}</p>
                    <p className="text-sm text-neutral-600">
                      Stock actual: <span className="font-semibold text-rose-700">{product.quantity}</span>
                      {' '}| Minimo: <span className="font-semibold">{product.minimum_stock}</span>
                    </p>
                  </div>
                ))}
                {lowStockProducts.length > 5 ? (
                  <p className="text-xs text-neutral-500">Y {lowStockProducts.length - 5} producto(s) mas con alerta...</p>
                ) : null}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h5 className="mb-3 text-base font-semibold text-neutral-900">Proximas Citas</h5>

            {loading ? (
              <p className="text-sm text-neutral-500">Cargando proximas citas...</p>
            ) : upcomingAppointments.length === 0 ? (
              <p className="text-sm text-neutral-500">No hay citas pendientes o aceptadas por ahora.</p>
            ) : (
              <div className="space-y-2">
                {upcomingAppointments.map((appointment) => (
                  <article key={appointment.id} className="rounded-xl bg-neutral-50 p-3">
                    <div className="font-semibold text-neutral-900">
                      {appointment.Client?.full_name ?? 'Cliente sin nombre'}
                      <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${statusClassName[appointment.status]}`}>
                        {statusLabel[appointment.status]}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500">{appointment.Service?.name ?? 'Servicio no definido'}</p>
                    <p className="text-xs text-neutral-500">
                      {new Date(appointment.appointment_date).toLocaleString()}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h5 className="mb-3 text-base font-semibold text-neutral-900">Actividad Reciente</h5>

            {loading ? (
              <p className="text-sm text-neutral-500">Cargando actividad...</p>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-neutral-500">Aun no hay actividad registrada.</p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((appointment) => (
                  <article key={appointment.id} className="rounded-xl bg-neutral-50 p-3 text-left">
                    <p className="font-medium text-neutral-900">
                      Cita {statusLabel[appointment.status]} de {appointment.Client?.full_name ?? 'cliente'}
                    </p>
                    <p className="text-sm text-neutral-500">{appointment.Service?.name ?? 'Servicio no definido'}</p>
                    <p className="text-xs text-neutral-500">
                      {new Date(appointment.appointment_date).toLocaleString()}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;