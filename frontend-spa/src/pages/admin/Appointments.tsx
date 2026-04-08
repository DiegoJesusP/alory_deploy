import { useCallback, useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import api from "@/api/axios";

type AppointmentStatus = "PENDING" | "ACCEPTED" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
type StatusFilter = "ALL" | AppointmentStatus;

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

interface AppointmentForm {
  client_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  employee_id: string;
  notes: string;
}

interface ApiEnvelope<T> {
  result?: T;
  text?: string;
}

const EMPTY_FORM: AppointmentForm = {
  client_id: "",
  service_id: "",
  appointment_date: "",
  appointment_time: "",
  employee_id: "",
  notes: "",
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

const CANCELLABLE_STATUSES: AppointmentStatus[] = ["PENDING", "ACCEPTED", "SCHEDULED"];

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

const toMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { text?: string; message?: string } | undefined;
    return data?.text || data?.message || error.message || fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
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

const asLocalDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { date: "", time: "" };
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
};

export default function AppointmentsPage() {
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";

  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<AppointmentItem | null>(null);

  const [form, setForm] = useState<AppointmentForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const title = editing ? "Editar cita" : "Nueva cita";
  const activeAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.status !== "CANCELLED").length,
    [appointments]
  );
  const filteredAppointments = useMemo(() => {
    const sorted = [...appointments].sort(
      (a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
    );

    if (statusFilter === "ALL") return sorted;

    return sorted.filter((appointment) => appointment.status === statusFilter);
  }, [appointments, statusFilter]);

  const canCancelAppointment = (status: AppointmentStatus) => CANCELLABLE_STATUSES.includes(status);

  const loadCatalogs = useCallback(async () => {
    try {
      const [clientsRes, servicesRes] = await Promise.all([
        api.get("clients/getAllClients?page=1&size=200"),
        api.get("services/getAll?page=1&size=200"),
      ]);

      setClients(unwrapList<ClientOption>(clientsRes.data));
      setServices(unwrapList<ServiceOption>(servicesRes.data));

      if (isAdmin) {
        const employeesRes = await api.get("users/getAllEmployees?page=1&size=200");
        setEmployees(unwrapList<EmployeeOption>(employeesRes.data));
      }
    } catch (error) {
      const message = toMessage(error, "No fue posible cargar catalogos para citas.");
      setScreenError(message);
      toast.error("No se pudieron cargar catalogos", { description: message });
    }
  }, [isAdmin]);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setScreenError(null);
      const response = await api.get("appointments/getAll");
      setAppointments(unwrapList<AppointmentItem>(response.data));
    } catch (error) {
      const message = toMessage(error, "No fue posible obtener las citas.");
      setScreenError(message);
      toast.error("No se pudieron cargar citas", { description: message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.all([loadCatalogs(), loadAppointments()]);
  }, [loadCatalogs, loadAppointments]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (appointment: AppointmentItem) => {
    const parsedDate = asLocalDateTime(appointment.appointment_date);

    setEditing(appointment);
    setFormError(null);
    setForm({
      client_id: String(appointment.client_id),
      service_id: String(appointment.service_id),
      employee_id: String(appointment.employee_id),
      appointment_date: parsedDate.date,
      appointment_time: parsedDate.time,
      notes: appointment.notes ?? "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    setFormError(null);
  };

  const onChange = (field: keyof AppointmentForm, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    if (formError) setFormError(null);
  };

  const validate = () => {
    if (!form.client_id) return "Selecciona un cliente.";
    if (!form.service_id) return "Selecciona un servicio.";
    if (!form.appointment_date) return "Selecciona la fecha.";
    if (!form.appointment_time) return "Selecciona la hora.";
    if (isAdmin && !form.employee_id) return "Selecciona un empleado asignado.";
    return null;
  };

  const saveAppointment = async () => {
    const validationMessage = validate();

    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    const payload = {
      client_id: Number(form.client_id),
      service_id: Number(form.service_id),
      employee_id: isAdmin ? Number(form.employee_id) : undefined,
      appointment_date: form.appointment_date,
      appointment_time: form.appointment_time,
      notes: form.notes.trim() || undefined,
    };

    try {
      if (editing) {
        await api.put(`appointments/update/${editing.id}`, payload);
        toast.success("Cita actualizada");
      } else {
        await api.post("appointments/create", payload);
        toast.success("Cita creada");
      }

      closeModal();
      await loadAppointments();
    } catch (error) {
      const message = toMessage(error, "No se pudo guardar la cita.");
      setFormError(message);
      toast.error("No se pudo guardar la cita", { description: message });
    }
  };

  const cancelAppointment = async (appointment: AppointmentItem) => {
    if (!canCancelAppointment(appointment.status)) return;

    try {
      await api.patch(`appointments/cancel/${appointment.id}`);
      await loadAppointments();
      toast.success("Cita cancelada");
    } catch (error) {
      const message = toMessage(error, "No se pudo cancelar la cita.");
      setScreenError(message);
      toast.error("No se pudo cancelar la cita", { description: message });
    }
  };

  return (
    <DashboardLayout>
      <section className="rounded-2xl border border-[#e8dcc8] bg-[#fffdf9] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#2b2218]">Citas</h1>
            <p className="mt-1 text-base text-[#7a684e]">
              Agenda, consulta, modifica y cancela citas de clientes con sus servicios.
            </p>

            <div className="mt-3 inline-flex items-center rounded-full border border-[#e8dcc8] bg-white px-4 py-1.5 text-sm font-medium text-[#5d4d36]">
              Activas: <span className="ml-1 font-semibold text-[#2f271f]">{activeAppointments}</span>
              <span className="mx-2 text-[#ccb991]">|</span>
              Totales: <span className="ml-1 font-semibold text-[#2f271f]">{appointments.length}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="rounded-full border border-[#b8962e] bg-[#b8962e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#9f7f22]"
          >
            + Nueva cita
          </button>
        </div>
      </section>

      {screenError && (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {screenError}
        </p>
      )}

      <section className="mt-4 rounded-2xl border border-[#e8dcc8] bg-white p-4">
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-[#4f402e]">Historial de reservaciones</h2>

          <div className="flex flex-wrap items-center gap-2">
            {([
              { key: "ALL", label: "Todas" },
              { key: "PENDING", label: "Pendientes" },
              { key: "ACCEPTED", label: "Aceptadas" },
              { key: "COMPLETED", label: "Completadas" },
              { key: "CANCELLED", label: "Canceladas" },
            ] as Array<{ key: StatusFilter; label: string }>).map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setStatusFilter(option.key)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  statusFilter === option.key
                    ? "border-[#b8962e] bg-[#b8962e] text-white"
                    : "border-[#e1d2b8] bg-[#fffdf9] text-[#6f5d43] hover:border-[#bfa476]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {(["PENDING", "ACCEPTED", "COMPLETED", "CANCELLED"] as AppointmentStatus[]).map((status) => (
              <span key={status} className={`rounded-full px-2.5 py-1 font-semibold ${STATUS_META[status].className}`}>
                {STATUS_META[status].label}
              </span>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="mt-3 text-sm text-[#7a684e]">Cargando citas...</p>
        ) : appointments.length === 0 ? (
          <p className="mt-3 text-sm text-[#7a684e]">No hay citas registradas.</p>
        ) : filteredAppointments.length === 0 ? (
          <p className="mt-3 text-sm text-[#7a684e]">No hay reservaciones para ese estatus.</p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredAppointments.map((appointment) => {
              const dateTime = formatDateAndTime(appointment.appointment_date);
              const statusMeta = STATUS_META[appointment.status] ?? {
                label: appointment.status,
                className: "bg-slate-100 text-slate-700 border border-slate-200",
              };
              const canCancel = canCancelAppointment(appointment.status);

              return (
              <article key={appointment.id} className="rounded-xl border border-[#f0e6d6] bg-[#fdfaf4] p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-2xl font-semibold leading-[1.15] text-[#2f271f] [font-family:var(--font-spa-display)]">
                    {appointment.Client?.full_name ?? "Sin cliente"}
                  </p>
                  <span className={`rounded-full px-2 py-0.5 text-sm font-semibold ${statusMeta.className}`}>
                    {statusMeta.label}
                  </span>
                </div>

                <p className="mt-2 text-base font-medium text-[#7d6a4d] [font-family:var(--font-spa-body)]">
                  Servicio reservado: {appointment.Service?.name ?? "Sin servicio"}
                </p>
                <p className="text-base font-medium text-[#7d6a4d] [font-family:var(--font-spa-body)]">
                  Fecha: {dateTime.date}
                </p>
                <p className="text-base font-medium text-[#7d6a4d] [font-family:var(--font-spa-body)]">
                  Hora: {dateTime.time}
                </p>
                <p className="text-base font-semibold tracking-tight text-[#6f5632] [font-family:var(--font-spa-body)]">
                  Estatus de la reservación: {statusMeta.label}
                </p>
                <p className="text-sm text-[#8a7759]">Empleado asignado: {appointment.User?.full_name ?? "Sin empleado"}</p>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(appointment)}
                    className="rounded-full border border-[#d7c7aa] px-3 py-1 text-sm font-medium text-[#6f5d43] hover:border-[#bfa476]"
                    disabled={appointment.status === "CANCELLED"}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => cancelAppointment(appointment)}
                    className="rounded-full border border-rose-300 px-3 py-1 text-sm font-medium text-rose-700 hover:bg-rose-50"
                    disabled={!canCancel}
                    title={canCancel ? "Cancelar reservación" : "Solo se puede cancelar una reservación pendiente o aceptada"}
                  >
                    Cancelar reservación
                  </button>
                </div>
                {!canCancel ? (
                  <p className="mt-2 text-xs text-[#8a7759]">
                    Solo se puede cancelar cuando el estatus es Pendiente o Aceptada.
                  </p>
                ) : null}
              </article>
              );
            })}
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e1810]/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-[#e5d8c2] bg-[#fffdf9] shadow-[0_20px_60px_rgba(36,24,8,0.22)]">
            <header className="border-b border-[#eee2cb] bg-[#f9f4e9] px-5 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#2b2218]">{title}</h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-[#ddceb2] px-3 py-1 text-sm text-[#7a684e]"
                >
                  ✕
                </button>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#5d4d36]">Cliente *</label>
                <select
                  value={form.client_id}
                  onChange={(event) => onChange("client_id", event.target.value)}
                  className="rounded-lg border border-[#d8c8ab] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#dfcc98]"
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#5d4d36]">Servicio *</label>
                <select
                  value={form.service_id}
                  onChange={(event) => onChange("service_id", event.target.value)}
                  className="rounded-lg border border-[#d8c8ab] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#dfcc98]"
                >
                  <option value="">Seleccionar servicio</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#5d4d36]">Fecha *</label>
                <input
                  type="date"
                  value={form.appointment_date}
                  onChange={(event) => onChange("appointment_date", event.target.value)}
                  className="rounded-lg border border-[#d8c8ab] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#dfcc98]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#5d4d36]">Hora *</label>
                <input
                  type="time"
                  value={form.appointment_time}
                  onChange={(event) => onChange("appointment_time", event.target.value)}
                  className="rounded-lg border border-[#d8c8ab] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#dfcc98]"
                />
              </div>

              {isAdmin && (
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-[#5d4d36]">Empleado asignado</label>
                  <select
                    value={form.employee_id}
                    onChange={(event) => onChange("employee_id", event.target.value)}
                    className="rounded-lg border border-[#d8c8ab] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#dfcc98]"
                  >
                    <option value="">Seleccionar empleado</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>{employee.full_name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-[#5d4d36]">Notas</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(event) => onChange("notes", event.target.value)}
                  className="rounded-lg border border-[#d8c8ab] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#dfcc98]"
                />
              </div>

              {formError && (
                <p className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </p>
              )}
            </div>

            <footer className="flex justify-end gap-3 border-t border-[#eee2cb] bg-[#f9f4e9] px-5 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-[#d7c7aa] px-4 py-2 text-sm font-semibold text-[#6f5d43]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void saveAppointment()}
                className="rounded-full border border-[#b8962e] bg-[#b8962e] px-5 py-2 text-sm font-semibold text-white"
              >
                {editing ? "Guardar cambios" : "Registrar cita"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
