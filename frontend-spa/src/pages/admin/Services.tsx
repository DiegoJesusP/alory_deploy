import { useEffect, useMemo, useState, useRef, useCallback, type ChangeEvent } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import {
  createService,
  deactivateService,
  getServices,
  reactivateService,
  updateService,
} from "@/services/serviceService";
import type { ServiceEntity, ServiceFormInput } from "@/types/service.types";

type ModalMode = "create" | "edit" | null;

interface FormState {
  name: string;
  price: string;
  duration: string;
  description: string;
  image: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  price: "",
  duration: "",
  description: "",
  image: "",
};

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const toMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { text?: string; message?: string } | undefined;
    return data?.text || data?.message || error.message || fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingService, setEditingService] = useState<ServiceEntity | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const activeCount = useMemo(() => services.filter((service) => service.is_active).length, [services]);
  const filteredServices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return services;

    return services.filter((service) => {
      const fields = [service.name, service.description ?? "", String(service.duration), String(service.price)];
      return fields.some((field) => field.toLowerCase().includes(term));
    });
  }, [searchTerm, services]);

  const loadServices = async () => {
    try {
      setLoading(true);
      setScreenError(null);
      const data = await getServices();
      setServices(data);
    } catch (error) {
      const message = toMessage(error, "No fue posible obtener los servicios.");
      setScreenError(message);
      toast.error("Error al cargar servicios", { description: message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadServices();
  }, []);

  const openCreate = () => {
    setEditingService(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsClosing(false);
    setModalMode("create");
  };

  const openEdit = (service: ServiceEntity) => {
    setEditingService(service);
    setForm({
      name: service.name,
      price: String(service.price),
      duration: String(service.duration),
      description: service.description ?? "",
      image: service.image ?? "",
    });
    setFormError(null);
    setIsClosing(false);
    setModalMode("edit");
  };

  const closeModal = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setIsClosing(false);
    setModalMode(null);
  }, []);

  const requestCloseModal = useCallback(() => {
    if (saving || isClosing) return;

    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      closeModal();
    }, 180);
  }, [closeModal, isClosing, saving]);

  const handleModalOverlayAnimationEnd = () => {
    if (!isClosing) return;
    closeModal();
  };

  useEffect(() => {
    if (!modalMode) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        requestCloseModal();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onEscape);

      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [modalMode, requestCloseModal]);

  const onImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Selecciona un archivo de imagen valido.");
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setFormError("La imagen supera 5MB. Usa una imagen mas ligera.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) {
        setFormError("No fue posible cargar la imagen.");
        return;
      }

      setForm((previous) => ({ ...previous, image: result }));
      setFormError(null);
    };

    reader.onerror = () => {
      setFormError("Ocurrio un problema al leer la imagen seleccionada.");
    };

    reader.readAsDataURL(file);
  };

  const onChange = (field: keyof FormState, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    if (formError) setFormError(null);
  };

  const buildPayload = (): ServiceFormInput | null => {
    if (!form.name.trim()) {
      setFormError("El nombre es obligatorio.");
      return null;
    }

    const parsedPrice = Number(form.price);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError("El precio debe ser mayor a 0.");
      return null;
    }

    const parsedDuration = Number(form.duration);
    if (!Number.isInteger(parsedDuration) || parsedDuration <= 0) {
      setFormError("La duracion debe ser un entero mayor a 0.");
      return null;
    }

    return {
      name: form.name.trim(),
      price: parsedPrice,
      duration: parsedDuration,
      description: form.description.trim() || undefined,
      image: form.image.trim() || undefined,
      is_active: true,
    };
  };

  const onSubmit = async () => {
    const payload = buildPayload();
    if (!payload) return;

    try {
      setSaving(true);
      setFormError(null);

      if (modalMode === "create") {
        const created = await createService(payload);
        setServices((previous) => [created, ...previous]);
        toast.success("Servicio registrado");
      }

      if (modalMode === "edit" && editingService) {
        const updated = await updateService(editingService.id, payload);
        setServices((previous) =>
          previous.map((service) => (service.id === updated.id ? updated : service))
        );
        toast.success("Servicio actualizado");
      }

      requestCloseModal();
    } catch (error) {
      const message = toMessage(error, "No se pudo guardar el servicio.");
      setFormError(message);
      toast.error("No se pudo guardar el servicio", { description: message });
    } finally {
      setSaving(false);
    }
  };

  const onDeactivate = async (service: ServiceEntity) => {
    if (!service.is_active) return;

    const confirmed = window.confirm(`Desactivar el servicio "${service.name}"?`);
    if (!confirmed) return;

    try {
      const updated = await deactivateService(service.id);
      setServices((previous) =>
        previous.map((item) => (item.id === updated.id ? updated : item))
      );
      toast.success("Servicio desactivado");
    } catch (error) {
      const message = toMessage(error, "No fue posible desactivar el servicio.");
      setScreenError(message);
      toast.error("No se pudo desactivar el servicio", { description: message });
    }
  };

  const onReactivate = async (service: ServiceEntity) => {
    if (service.is_active) return;

    const confirmed = window.confirm(`Reactivar el servicio "${service.name}"?`);
    if (!confirmed) return;

    try {
      const updated = await reactivateService(service.id);
      setServices((previous) =>
        previous.map((item) => (item.id === updated.id ? updated : item))
      );
      toast.success("Servicio reactivado");
    } catch (error) {
      const message = toMessage(error, "No fue posible reactivar el servicio.");
      setScreenError(message);
      toast.error("No se pudo reactivar el servicio", { description: message });
    }
  };

  const modalTitle = modalMode === "create" ? "Nuevo servicio" : "Editar servicio";
  const modalActionLabel = modalMode === "create" ? "Registrar servicio" : "Guardar cambios";

  return (
    <DashboardLayout>
      <div className="pb-8">
      <section className="rounded-2xl border border-[#e8dcc8] bg-[#fffdf9] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#2b2218]">Gestion de servicios</h1>
            <p className="mt-1 text-base text-[#7a684e]">
              Registra, edita y administra los servicios visibles para tus clientes.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="rounded-full border border-[#b8962e] bg-[#b8962e] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#9f7f22]"
          >
            + Nuevo servicio
          </button>
        </div>

        <div className="mt-4 inline-flex items-center rounded-full border border-[#e8dcc8] bg-white px-4 py-1.5 text-sm font-medium text-[#5d4d36]">
          Activos: <span className="ml-1 font-semibold text-[#2f271f]">{activeCount}</span>
          <span className="mx-2 text-[#ccb991]">|</span>
          Totales: <span className="ml-1 font-semibold text-[#2f271f]">{services.length}</span>
        </div>
      </section>

      {screenError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {screenError}
        </div>
      )}

      <section className="mt-4 rounded-2xl border border-[#e8dcc8] bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-[#4f402e]">Lista de servicios</h2>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por nombre, descripcion, duracion o precio"
            className="w-full rounded-full border border-[#d8c8ab] bg-[#fffdf9] px-4 py-2 text-sm text-[#2f271f] outline-none transition placeholder:text-[#9f8b6a] focus:border-[#c8ae71] focus:ring-2 focus:ring-[#ecd9a9] sm:max-w-sm"
          />
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-[#7a684e]">Cargando servicios...</p>
        ) : services.length === 0 ? (
          <p className="mt-4 text-sm text-[#7a684e]">Aun no tienes servicios registrados.</p>
        ) : filteredServices.length === 0 ? (
          <p className="mt-4 text-sm text-[#7a684e]">No se encontraron servicios con esa busqueda.</p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredServices.map((service) => (
              <article key={service.id} className="rounded-xl border border-[#f0e6d6] bg-[#fdfaf4] p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-2xl font-semibold leading-[1.15] text-[#2f271f] [font-family:var(--font-spa-display)]">
                    {service.name}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-sm font-semibold ${
                      service.is_active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {service.is_active ? "Activo" : "Inactivo"}
                  </span>
                </div>

                <p className="mt-2 text-base font-medium text-[#7d6a4d] [font-family:var(--font-spa-body)]">
                  Duracion: {service.duration} min
                </p>
                <p className="text-xl font-semibold tracking-tight text-[#6f5632] [font-family:var(--font-spa-body)]">
                  Precio: {money.format(Number(service.price))}
                </p>

                {service.description && (
                  <p className="mt-1 text-base font-medium leading-relaxed text-[#8a7759] [font-family:var(--font-spa-body)]">
                    {service.description}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(service)}
                    className="rounded-full border border-[#d7c7aa] bg-white px-3 py-1.5 text-sm font-semibold text-[#5d4d36] transition hover:border-[#bfa476] hover:text-[#4f402e]"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => (service.is_active ? onDeactivate(service) : onReactivate(service))}
                    className={`rounded-full border bg-white px-3 py-1.5 text-sm font-semibold transition ${
                      service.is_active
                        ? "border-[#d9b7b7] text-[#8f4747] hover:border-[#c99a9a]"
                        : "border-[#b8d9bf] text-emerald-700 hover:border-[#96c8a1]"
                    }`}
                  >
                    {service.is_active ? "Desactivar" : "Reactivar"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {modalMode && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-[#1b140c]/55 p-4 backdrop-blur-md sm:p-6 ${
            isClosing ? "modal-overlay-exit" : "modal-overlay-enter"
          }`}
          onMouseDown={requestCloseModal}
          onAnimationEnd={handleModalOverlayAnimationEnd}
          role="presentation"
        >
          <div
            className={`flex w-full max-w-4xl max-h-[92vh] flex-col overflow-hidden rounded-3xl border border-[#e5d8c2] bg-[#fffdf9] shadow-[0_24px_80px_rgba(28,18,7,0.28)] ${
              isClosing ? "modal-panel-exit" : "modal-panel-enter"
            }`}
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="services-modal-title"
          >
            <header className="border-b border-[#eee2cb] bg-gradient-to-r from-[#fbf7ee] via-[#f8f2e6] to-[#f5ebd9] px-5 py-4 sm:px-7 sm:py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9a814e]">Gestion de catalogo</p>
                  <h3 id="services-modal-title" className="mt-1 text-2xl font-semibold text-[#2b2218] sm:text-3xl">{modalTitle}</h3>
                  <p className="mt-1.5 text-sm text-[#7a684e]">
                    Completa la informacion del servicio para mantener tu catalogo actualizado.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={requestCloseModal}
                  className="rounded-full border border-[#d8c8ab] bg-white/90 px-3 py-1.5 text-sm font-semibold text-[#7a684e] transition hover:border-[#bfa476] hover:text-[#4f402e]"
                >
                  ✕
                </button>
              </div>
            </header>

            <div className="min-h-0 overflow-y-auto">
              <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-[#5d4d36]">Nombre del servicio *</label>
                    <input
                      value={form.name}
                      onChange={(event) => onChange("name", event.target.value)}
                      placeholder="Ej. Limpieza facial profunda"
                      className="w-full rounded-xl border border-[#d8c8ab] bg-white px-3.5 py-2.5 text-sm text-[#2f271f] outline-none transition focus:border-[#c8ae71] focus:ring-2 focus:ring-[#ecd9a9]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#5d4d36]">Precio (MXN) *</label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={form.price}
                      onChange={(event) => onChange("price", event.target.value)}
                      placeholder="Ej. 850"
                      className="w-full rounded-xl border border-[#d8c8ab] bg-white px-3.5 py-2.5 text-sm text-[#2f271f] outline-none transition focus:border-[#c8ae71] focus:ring-2 focus:ring-[#ecd9a9]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#5d4d36]">Duracion (min) *</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={form.duration}
                      onChange={(event) => onChange("duration", event.target.value)}
                      placeholder="Ej. 60"
                      className="w-full rounded-xl border border-[#d8c8ab] bg-white px-3.5 py-2.5 text-sm text-[#2f271f] outline-none transition focus:border-[#c8ae71] focus:ring-2 focus:ring-[#ecd9a9]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#5d4d36]">Descripcion</label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(event) => onChange("description", event.target.value)}
                    placeholder="Describe beneficios, tipo de tratamiento y recomendaciones."
                    className="w-full rounded-xl border border-[#d8c8ab] bg-white px-3.5 py-2.5 text-sm text-[#2f271f] outline-none transition focus:border-[#c8ae71] focus:ring-2 focus:ring-[#ecd9a9]"
                  />
                </div>

                <div className="rounded-2xl border border-[#e8dcc8] bg-[#f9f4e9] p-4">
                  <p className="text-sm font-semibold text-[#5d4d36]">Imagen del servicio</p>
                  <p className="mt-1 text-xs text-[#7a684e]">Puedes pegar una URL o subir una foto de tu dispositivo (maximo 5MB).</p>

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      value={form.image}
                      onChange={(event) => onChange("image", event.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-[#d8c8ab] bg-white px-3.5 py-2.5 text-sm text-[#2f271f] outline-none transition focus:border-[#c8ae71] focus:ring-2 focus:ring-[#ecd9a9]"
                    />

                    <input
                      type="file"
                      accept="image/*"
                      onChange={onImageFileChange}
                      className="w-full rounded-xl border border-dashed border-[#ccb88f] bg-white px-3.5 py-2 text-sm text-[#2f271f]"
                    />
                  </div>
                </div>

                {formError && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                    {formError}
                  </p>
                )}
              </div>

              <aside className="rounded-2xl border border-[#e8dcc8] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a814e]">Vista previa</p>
                <div className="mt-2 overflow-hidden rounded-xl border border-[#efe3cd] bg-[#faf7f1]">
                  {form.image ? (
                    <img
                      src={form.image}
                      alt="Vista previa del servicio"
                      className="h-52 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-52 items-center justify-center px-6 text-center text-sm text-[#927e61]">
                      Agrega una imagen para previsualizar el servicio.
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-base font-semibold text-[#2f271f]">{form.name.trim() || "Nombre del servicio"}</p>
                  <p className="text-sm text-[#6a5a44]">{form.description.trim() || "La descripcion aparecera aqui para que puedas revisar el resultado visual antes de guardar."}</p>
                  <p className="text-sm font-semibold text-[#8b6c2d]">
                    {Number(form.price) > 0 ? money.format(Number(form.price)) : "Precio pendiente"}
                    <span className="mx-2 text-[#d0c1a3]">•</span>
                    {Number(form.duration) > 0 ? `${form.duration} min` : "Duracion pendiente"}
                  </p>
                </div>
              </aside>
              </div>
            </div>

            <footer className="flex flex-col-reverse gap-2 border-t border-[#eee2cb] bg-[#f9f4e9] px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7">
              <button
                type="button"
                onClick={requestCloseModal}
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
                {saving ? "Guardando..." : modalActionLabel}
              </button>
            </footer>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
