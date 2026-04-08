import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { useNavigate } from "react-router";
import { CalendarClock, CircleCheck, Clock3, Users } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import api from "@/api/axios";

type AppointmentStatus = "PENDING" | "ACCEPTED" | "SCHEDULED" | "COMPLETED" | "CANCELLED";

interface ApiEnvelope<T> {
  result?: T;
  metadata?: {
    total?: number;
  };
  text?: string;
  message?: string;
}

interface ClientOption {
  id: number;
  full_name: string;
}

interface ServiceOption {
  id: number;
  name: string;
}

interface EmployeeOption {
  id: number;
  full_name: string;
}

interface AppointmentItem {
  id: number;
  client_id: number;
  service_id: number;
  employee_id: number;
  appointment_date: string;
  status: AppointmentStatus;
  notes?: string | null;
  Client?: ClientOption;
  Service?: ServiceOption;
  User?: EmployeeOption;
}

interface EmployeeStats {
  clients: number;
  services: number;
  myAppointments: number;
}

const EMPTY_STATS: EmployeeStats = {
  clients: 0,
  services: 0,
  myAppointments: 0,
};

const STATUS_META: Record<AppointmentStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Pendiente",
    className: "bg-amber-100 text-amber-700 border border-amber-200",
  },
  ACCEPTED: {
    label: "Aceptada",
    className: "bg-blue-100 text-blue-700 border border-blue-200",
  },
  SCHEDULED: {
    label: "Aceptada",
    className: "bg-blue-100 text-blue-700 border border-blue-200",
  },
  COMPLETED: {
    label: "Completada",
    className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  },
  CANCELLED: {
    label: "Cancelada",
    className: "bg-rose-100 text-rose-700 border border-rose-200",
  },
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

const toMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { text?: string; message?: string } | undefined;
    return data?.text || data?.message || error.message || fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
};

const formatDateAndTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { date: "Sin fecha", time: "Sin hora" };
  }

  return {
    date: date.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" }),
    time: date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false }),
  };
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState<EmployeeStats>(EMPTY_STATS);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [screenError, setScreenError] = useState<string | null>(null);
  const employeeName = user?.full_name?.trim() || user?.username?.trim() || "Empleado";

  const myAppointments = useMemo(() => {
    const displayName = user?.full_name?.trim().toLowerCase();
    if (!displayName) return appointments;

    return appointments.filter((item) => item.User?.full_name?.trim().toLowerCase() === displayName);
  }, [appointments, user?.full_name]);

  const upcomingAppointments = useMemo(() => {
    const now = Date.now();
    return myAppointments
      .filter((item) => ["PENDING", "ACCEPTED", "SCHEDULED"].includes(item.status))
      .filter((item) => new Date(item.appointment_date).getTime() >= now)
      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
      .slice(0, 5);
  }, [myAppointments]);

  const completedCount = useMemo(
    () => myAppointments.filter((item) => item.status === "COMPLETED").length,
    [myAppointments]
  );

  const pendingCount = useMemo(
    () => myAppointments.filter((item) => ["PENDING", "ACCEPTED", "SCHEDULED"].includes(item.status)).length,
    [myAppointments]
  );

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setScreenError(null);

        const [clientsRes, servicesRes, appointmentsRes] = await Promise.all([
          api.get("clients/getAllClients?page=1&size=1"),
          api.get("services/getAll?page=1&size=1"),
          api.get("appointments/getAll"),
        ]);

        const appointmentsData = (appointmentsRes.data as ApiEnvelope<AppointmentItem[]>)?.result;
        const appointmentRows = Array.isArray(appointmentsData)
          ? appointmentsData
          : Array.isArray(appointmentsRes.data)
            ? (appointmentsRes.data as AppointmentItem[])
            : [];

        setAppointments(appointmentRows);
        setStats({
          clients: readCount(clientsRes.data),
          services: readCount(servicesRes.data),
          myAppointments: appointmentRows.length,
        });
      } catch (error) {
        const message = toMessage(error, "No fue posible cargar tu dashboard.");
        setScreenError(message);
        toast.error("No fue posible cargar el dashboard", { description: message });
      } finally {
        setLoading(false);
      }
    };

    void loadDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <div className="pb-8">
        <section className="rounded-2xl border border-[#e8dcc8] bg-[#fffdf9] p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#2b2218]">
                Dashboard de {employeeName}
              </h1>
              <p className="mt-1 text-base text-[#7a684e]">
                Consulta el estado de tus citas, identifica pendientes y actua rapido sobre tu agenda.
              </p>
            </div>
          </div>
        </section>

        {screenError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {screenError}
          </div>
        )}

        <section className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-xl border border-[#f0e6d6] bg-[#fdfaf4] p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs tracking-wide text-[#8b7658]">CLIENTES</p>
                <p className="text-3xl font-semibold text-[#2f271f]">{loading ? "..." : stats.clients}</p>
              </div>
              <Users className="h-5 w-5 text-[#9a814e]" />
            </div>
          </article>

          <article className="rounded-xl border border-[#f0e6d6] bg-[#fdfaf4] p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs tracking-wide text-[#8b7658]">SERVICIOS DISPONIBLES</p>
                <p className="text-3xl font-semibold text-[#2f271f]">{loading ? "..." : stats.services}</p>
              </div>
              <CalendarClock className="h-5 w-5 text-[#9a814e]" />
            </div>
          </article>

          <article className="rounded-xl border border-[#f0e6d6] bg-[#fdfaf4] p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs tracking-wide text-[#8b7658]">PENDIENTES / ACEPTADAS</p>
                <p className="text-3xl font-semibold text-[#2f271f]">{loading ? "..." : pendingCount}</p>
              </div>
              <Clock3 className="h-5 w-5 text-[#b8962e]" />
            </div>
          </article>

          <article className="rounded-xl border border-[#f0e6d6] bg-[#fdfaf4] p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs tracking-wide text-[#8b7658]">COMPLETADAS</p>
                <p className="text-3xl font-semibold text-[#2f271f]">{loading ? "..." : completedCount}</p>
              </div>
              <CircleCheck className="h-5 w-5 text-emerald-600" />
            </div>
          </article>
        </section>

        <section className="mt-4 rounded-2xl border border-[#e8dcc8] bg-white p-4">
          <h2 className="text-base font-semibold text-[#4f402e]">Proximas reservaciones</h2>

          {loading ? (
            <p className="mt-3 text-sm text-[#7a684e]">Cargando agenda...</p>
          ) : upcomingAppointments.length === 0 ? (
            <p className="mt-3 text-sm text-[#7a684e]">No tienes reservaciones pendientes o aceptadas por ahora.</p>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {upcomingAppointments.map((appointment) => {
                const dateTime = formatDateAndTime(appointment.appointment_date);
                const statusMeta = STATUS_META[appointment.status] ?? {
                  label: appointment.status,
                  className: "bg-slate-100 text-slate-700 border border-slate-200",
                };

                return (
                  <article key={appointment.id} className="rounded-xl border border-[#f0e6d6] bg-[#fdfaf4] p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xl font-semibold leading-[1.15] text-[#2f271f]">
                        {appointment.Client?.full_name ?? "Sin cliente"}
                      </p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusMeta.className}`}>
                        {statusMeta.label}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-[#7d6a4d]">Servicio: {appointment.Service?.name ?? "Sin servicio"}</p>
                    <p className="text-sm text-[#7d6a4d]">Fecha: {dateTime.date}</p>
                    <p className="text-sm text-[#7d6a4d]">Hora: {dateTime.time}</p>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;