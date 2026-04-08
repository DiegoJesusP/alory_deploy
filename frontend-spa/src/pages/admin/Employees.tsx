import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { Eye, EyeOff, Mail, Pencil, Phone, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import api from "@/api/axios";

type UserType = "EMPLOYEE" | "SPECIALIST";

interface EmployeeItem {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  birth_date: string;
  username: string;
  role: string;
  is_active: boolean;
}

interface EmployeeForm {
  full_name: string;
  email: string;
  phone: string;
  birth_date: string;
  username: string;
  password: string;
  confirm_password: string;
  user_type: UserType;
  specialty: string;
}

interface ApiEnvelope<T> {
  result?: T;
  text?: string;
  message?: string;
}

type ModalMode = "create" | "edit";

const EMPTY_FORM: EmployeeForm = {
  full_name: "",
  email: "",
  phone: "",
  birth_date: "",
  username: "",
  password: "",
  confirm_password: "",
  user_type: "EMPLOYEE",
  specialty: "",
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

const unwrapEntity = <T,>(payload: unknown): T | undefined => {
  const envelope = payload as ApiEnvelope<T> | undefined;

  if (envelope && typeof envelope === "object" && "result" in envelope) {
    return envelope.result;
  }

  return payload as T;
};

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);
  const [form, setForm] = useState<EmployeeForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const activeEmployees = useMemo(() => employees.filter((item) => item.is_active).length, [employees]);
  const filteredEmployees = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return employees;

    return employees.filter((employee) => {
      const fields = [employee.full_name, employee.username, employee.email, employee.phone, employee.role];
      return fields.some((field) => field.toLowerCase().includes(term));
    });
  }, [employees, searchTerm]);

  const passwordChecks = useMemo(
    () => ({
      minLength: form.password.length >= 8,
      hasUppercase: /[A-Z]/.test(form.password),
      hasLowercase: /[a-z]/.test(form.password),
      hasNumber: /\d/.test(form.password),
      hasSymbol: /[^\w\s]/.test(form.password),
    }),
    [form.password]
  );

  const isPasswordStrong = useMemo(
    () => Object.values(passwordChecks).every(Boolean),
    [passwordChecks]
  );

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setScreenError(null);
      const response = await api.get("users/getAllEmployees?page=1&size=200");
      setEmployees(unwrapList<EmployeeItem>(response.data));
    } catch (error) {
      const message = toMessage(error, "No fue posible cargar empleados.");
      setScreenError(message);
      toast.error("No fue posible cargar empleados", { description: message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEmployees();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setEditingEmployeeId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (employee: EmployeeItem) => {
    setModalMode("edit");
    setEditingEmployeeId(employee.id);
    setForm({
      ...EMPTY_FORM,
      full_name: employee.full_name,
      email: employee.email,
      phone: employee.phone,
      birth_date: employee.birth_date ? String(employee.birth_date).slice(0, 10) : "",
      username: employee.username,
      password: "",
      confirm_password: "",
    });
    setFormError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setModalMode("create");
    setEditingEmployeeId(null);
  };

  const onChange = (field: keyof EmployeeForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formError) setFormError(null);
  };

  const validateForm = (): string | null => {
    if (!form.full_name.trim()) return "Nombre completo es obligatorio";
    if (!form.email.trim()) return "Correo electronico es obligatorio";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Correo electronico no valido";
    if (!form.phone.trim()) return "Telefono es obligatorio";
    if (form.phone.replace(/\D/g, "").length < 10) return "Telefono debe tener al menos 10 digitos";
    if (!form.birth_date) return "Fecha de nacimiento es obligatoria";

    const birthDate = new Date(form.birth_date);
    const now = new Date();
    if (birthDate > now) return "La fecha de nacimiento no puede ser futura";

    if (!form.username.trim()) return "Nombre de usuario es obligatorio";
    if (form.username.includes(" ")) return "Nombre de usuario no debe contener espacios";

    if (modalMode === "create" && !form.password) return "Contrasena es obligatoria";

    if (form.password && !isPasswordStrong) {
      return "Contrasena: minimo 8 caracteres, mayuscula, minuscula, numero y simbolo";
    }

    if (modalMode === "create" && !form.confirm_password) return "Confirmacion de contrasena es obligatoria";
    if (form.password || form.confirm_password) {
      if (!form.confirm_password) return "Confirmacion de contrasena es obligatoria";
      if (form.password !== form.confirm_password) return "Las contrasenas no coinciden";
    }

    if (form.user_type === "SPECIALIST" && !form.specialty.trim()) {
      return "Especialidad es obligatoria para tipo Especialista";
    }

    return null;
  };

  const onSubmit = async () => {
    const validationMessage = validateForm();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        birth_date: form.birth_date,
        username: form.username.trim(),
        ...(form.password ? { password: form.password } : {}),
      };

      if (modalMode === "create") {
        const response = await api.post("users/createEmployee", payload);
        const created = unwrapEntity<EmployeeItem>(response.data);

        if (!created) {
          throw new Error("No se pudo leer el empleado registrado");
        }

        setEmployees((prev) => [created, ...prev]);
        toast.success("Empleado registrado");
      }

      if (modalMode === "edit") {
        if (!editingEmployeeId) {
          throw new Error("No se encontro el empleado a editar");
        }

        const response = await api.put(`users/updateEmployee/${editingEmployeeId}`, payload);
        const updated = unwrapEntity<EmployeeItem>(response.data);

        if (!updated) {
          throw new Error("No se pudo leer el empleado actualizado");
        }

        setEmployees((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        toast.success("Empleado actualizado");
      }

      setIsModalOpen(false);
      setModalMode("create");
      setEditingEmployeeId(null);
      setForm(EMPTY_FORM);
    } catch (error) {
      const message = toMessage(error, "No fue posible guardar al empleado.");
      setFormError(message);
      toast.error("No se pudo guardar al empleado", { description: message });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (employee: EmployeeItem) => {
    const confirmed = window.confirm(`Eliminar al empleado \"${employee.full_name}\"?`);
    if (!confirmed) return;

    try {
      await api.delete(`users/deleteEmployee/${employee.id}`);
      setEmployees((prev) => prev.filter((item) => item.id !== employee.id));
      toast.success("Empleado eliminado");
    } catch (error) {
      const message = toMessage(error, "No fue posible eliminar al empleado.");
      toast.error("No se pudo eliminar al empleado", { description: message });
    }
  };

  const modalTitle = modalMode === "create" ? "Nuevo empleado" : "Editar empleado";
  const modalDescription =
    modalMode === "create"
      ? "Completa los campos obligatorios para crear la cuenta del empleado."
      : "Actualiza los datos del empleado. Si no deseas cambiar la contrasena, dejala en blanco.";
  const submitLabel = saving
    ? "Guardando..."
    : modalMode === "create"
      ? "Registrar empleado"
      : "Guardar cambios";

  return (
    <DashboardLayout>
      <div className="pb-8">
        <section className="rounded-2xl border border-[#e8dcc8] bg-[#fffdf9] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#2b2218]">Registro de empleados</h1>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-full border border-[#b8962e] bg-[#b8962e] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#9f7f22]"
            >
              + Nuevo empleado
            </button>
          </div>

          <div className="mt-4 inline-flex items-center rounded-full border border-[#e8dcc8] bg-white px-4 py-1.5 text-sm text-[#5d4d36]">
            Activos: <span className="ml-1 font-semibold text-[#2f271f]">{activeEmployees}</span>
            <span className="mx-2 text-[#ccb991]">|</span>
            Totales: <span className="ml-1 font-semibold text-[#2f271f]">{employees.length}</span>
          </div>
        </section>

        {screenError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {screenError}
          </div>
        )}

        <section className="mt-4 rounded-2xl border border-[#e8dcc8] bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-[#4f402e]">Empleados registrados</h2>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nombre, usuario, correo o telefono"
              className="w-full rounded-full border border-[#d8c8ab] bg-[#fffdf9] px-4 py-2 text-sm text-[#2f271f] outline-none transition placeholder:text-[#9f8b6a] focus:border-[#c8ae71] focus:ring-2 focus:ring-[#ecd9a9] sm:max-w-sm"
            />
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-[#7a684e]">Cargando empleados...</p>
          ) : employees.length === 0 ? (
            <p className="mt-4 text-sm text-[#7a684e]">Aun no hay empleados registrados.</p>
          ) : filteredEmployees.length === 0 ? (
            <p className="mt-4 text-sm text-[#7a684e]">No se encontraron empleados con esa busqueda.</p>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredEmployees.map((employee) => (
                <article key={employee.id} className="rounded-xl border border-[#f0e6d6] bg-[#fdfaf4] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#e8dcc8] bg-white text-[#8a7448]">
                        <User size={14} />
                      </span>
                      <p className="text-2xl font-semibold leading-[1.15] text-[#2f271f] [font-family:var(--font-spa-display)]">
                        {employee.full_name}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      {employee.role}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1.5">
                    <p className="flex items-center gap-1.5 text-base font-medium text-[#7d6a4d] [font-family:var(--font-spa-body)]">
                      <Mail size={13} className="text-[#9a814e]" />
                      <span>{employee.email}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-base font-medium text-[#7d6a4d] [font-family:var(--font-spa-body)]">
                      <Phone size={13} className="text-[#9a814e]" />
                      <span>{employee.phone}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-base font-semibold tracking-tight text-[#6f5632] [font-family:var(--font-spa-body)]">
                      <User size={13} className="text-[#9a814e]" />
                      <span>Usuario: {employee.username}</span>
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(employee)}
                      className="inline-flex items-center gap-1 rounded-full border border-[#d7c7aa] bg-white px-3 py-1.5 text-xs font-semibold text-[#5d4d36] transition hover:border-[#bfa476] hover:text-[#4f402e]"
                    >
                      <Pencil size={12} />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(employee)}
                      className="inline-flex items-center gap-1 rounded-full border border-[#d9b7b7] bg-white px-3 py-1.5 text-xs font-semibold text-[#8f4747] transition hover:border-[#c99a9a]"
                    >
                      <Trash2 size={12} />
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1b140c]/55 p-4 backdrop-blur-md sm:p-6">
            <div className="flex w-full max-w-3xl max-h-[92vh] flex-col overflow-hidden rounded-3xl border border-[#e5d8c2] bg-[#fffdf9] shadow-[0_24px_80px_rgba(28,18,7,0.28)]">
              <header className="border-b border-[#eee2cb] bg-gradient-to-r from-[#fbf7ee] via-[#f8f2e6] to-[#f5ebd9] px-5 py-4 sm:px-7 sm:py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9a814e]">Administracion</p>
                    <h3 className="mt-1 text-2xl font-semibold text-[#2b2218] sm:text-3xl">{modalTitle}</h3>
                    <p className="mt-1.5 text-sm text-[#7a684e]">{modalDescription}</p>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full border border-[#d8c8ab] bg-white/90 px-3 py-1.5 text-sm font-semibold text-[#7a684e] transition hover:border-[#bfa476] hover:text-[#4f402e]"
                  >
                    ✕
                  </button>
                </div>
              </header>

              <div className="min-h-0 overflow-y-auto p-5 sm:p-7">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-[#5d4d36]">Tipo de usuario *</label>
                    <select
                      value={form.user_type}
                      onChange={(event) => onChange("user_type", event.target.value as UserType)}
                      disabled={modalMode === "edit"}
                      className="w-full rounded-xl border border-[#d8c8ab] bg-white px-3.5 py-2.5 text-sm text-[#2f271f] outline-none transition focus:border-[#c8ae71] focus:ring-2 focus:ring-[#ecd9a9]"
                    >
                      <option value="EMPLOYEE">Empleado final</option>
                      <option value="SPECIALIST">Especialista</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-[#5d4d36]">Nombre completo *</label>
                    <input
                      value={form.full_name}
                      onChange={(event) => onChange("full_name", event.target.value)}
                      className="w-full rounded-xl border border-[#d8c8ab] bg-white px-3.5 py-2.5 text-sm text-[#2f271f] outline-none transition focus:border-[#c8ae71] focus:ring-2 focus:ring-[#ecd9a9]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#5d4d36]">Correo electronico *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => onChange("email", event.target.value)}
                      className="w-full rounded-xl border border-[#d8c8ab] bg-white px-3.5 py-2.5 text-sm text-[#2f271f] outline-none transition focus:border-[#c8ae71] focus:ring-2 focus:ring-[#ecd9a9]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#5d4d36]">Telefono *</label>
                    <input
                      value={form.phone}
                      onChange={(event) => onChange("phone", event.target.value)}
                      className="w-full rounded-xl border border-[#d8c8ab] bg-white px-3.5 py-2.5 text-sm text-[#2f271f] outline-none transition focus:border-[#c8ae71] focus:ring-2 focus:ring-[#ecd9a9]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#5d4d36]">Fecha de nacimiento *</label>
                    <input
                      type="date"
                      value={form.birth_date}
                      onChange={(event) => onChange("birth_date", event.target.value)}
                      className="w-full rounded-xl border border-[#d8c8ab] bg-white px-3.5 py-2.5 text-sm text-[#2f271f] outline-none transition focus:border-[#c8ae71] focus:ring-2 focus:ring-[#ecd9a9]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#5d4d36]">Nombre de usuario *</label>
                    <input
                      value={form.username}
                      onChange={(event) => onChange("username", event.target.value)}
                      className="w-full rounded-xl border border-[#d8c8ab] bg-white px-3.5 py-2.5 text-sm text-[#2f271f] outline-none transition focus:border-[#c8ae71] focus:ring-2 focus:ring-[#ecd9a9]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#5d4d36]">Contrasena *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(event) => onChange("password", event.target.value)}
                        className="w-full rounded-xl border border-[#d8c8ab] bg-white px-3.5 py-2.5 pr-11 text-sm text-[#2f271f] outline-none transition focus:border-[#c8ae71] focus:ring-2 focus:ring-[#ecd9a9]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((previous) => !previous)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#826f53] transition hover:bg-[#f4ead7] hover:text-[#5d4d36]"
                        aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#5d4d36]">Confirmacion de contrasena *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={form.confirm_password}
                        onChange={(event) => onChange("confirm_password", event.target.value)}
                        className="w-full rounded-xl border border-[#d8c8ab] bg-white px-3.5 py-2.5 pr-11 text-sm text-[#2f271f] outline-none transition focus:border-[#c8ae71] focus:ring-2 focus:ring-[#ecd9a9]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((previous) => !previous)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#826f53] transition hover:bg-[#f4ead7] hover:text-[#5d4d36]"
                        aria-label={showConfirmPassword ? "Ocultar confirmacion" : "Mostrar confirmacion"}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2 rounded-xl border border-[#e8dcc8] bg-[#f9f4e9] p-3.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a7448]">Seguridad de contrasena</p>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <p className={`text-xs ${passwordChecks.minLength ? "text-emerald-700" : "text-[#7a684e]"}`}>
                        {passwordChecks.minLength ? "✓" : "•"} Minimo 8 caracteres
                      </p>
                      <p className={`text-xs ${passwordChecks.hasUppercase ? "text-emerald-700" : "text-[#7a684e]"}`}>
                        {passwordChecks.hasUppercase ? "✓" : "•"} Al menos una mayuscula
                      </p>
                      <p className={`text-xs ${passwordChecks.hasLowercase ? "text-emerald-700" : "text-[#7a684e]"}`}>
                        {passwordChecks.hasLowercase ? "✓" : "•"} Al menos una minuscula
                      </p>
                      <p className={`text-xs ${passwordChecks.hasNumber ? "text-emerald-700" : "text-[#7a684e]"}`}>
                        {passwordChecks.hasNumber ? "✓" : "•"} Al menos un numero
                      </p>
                      <p className={`text-xs ${passwordChecks.hasSymbol ? "text-emerald-700" : "text-[#7a684e]"}`}>
                        {passwordChecks.hasSymbol ? "✓" : "•"} Al menos un simbolo
                      </p>
                      <p
                        className={`text-xs ${
                          form.confirm_password && form.password === form.confirm_password
                            ? "text-emerald-700"
                            : "text-[#7a684e]"
                        }`}
                      >
                        {form.confirm_password && form.password === form.confirm_password ? "✓" : "•"} Confirmacion coincide
                      </p>
                    </div>
                  </div>

                  {form.user_type === "SPECIALIST" && (
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-semibold text-[#5d4d36]">Especialidad *</label>
                      <input
                        value={form.specialty}
                        onChange={(event) => onChange("specialty", event.target.value)}
                        placeholder="Ej. Cosmetologia facial"
                        className="w-full rounded-xl border border-[#d8c8ab] bg-white px-3.5 py-2.5 text-sm text-[#2f271f] outline-none transition focus:border-[#c8ae71] focus:ring-2 focus:ring-[#ecd9a9]"
                      />
                    </div>
                  )}
                </div>

                {formError && (
                  <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                    {formError}
                  </p>
                )}
              </div>

              <footer className="flex flex-col-reverse gap-2 border-t border-[#eee2cb] bg-[#f9f4e9] px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-[#d7c7aa] bg-white px-5 py-2 text-sm font-semibold text-[#6f5d43] transition hover:border-[#bfa476] hover:text-[#4f402e]"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={saving}
                  className="rounded-full border border-[#b8962e] bg-[#b8962e] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#9f7f22] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitLabel}
                </button>
              </footer>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
