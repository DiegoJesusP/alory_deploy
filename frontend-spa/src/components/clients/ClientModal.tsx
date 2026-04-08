import { useCallback, useEffect, useRef, useState } from "react"
import type { Client } from "./../../types/clients.types"
import type { ClientModalMode } from "./../../types/modal.types"

// Usamos Pick para crear un tipo de "form" que omite campos gestionados por el backend
type ClientForm = Omit<Client, "id" | "created_at">
const EMPTY_CLIENT_FORM: ClientForm = {
  full_name: "",
  email: "",
  phone: "",
  allergies: "",
  preferences: "",
  clinical_data: "",
  birth_date: "",
  is_active: true
}

const getInitialClientForm = (
  mode: ClientModalMode,
  client?: Client | null
): ClientForm => {
  if (mode === "create" || !client) {
    return EMPTY_CLIENT_FORM
  }

  return {
    full_name: client.full_name,
    email: client.email ?? "",
    phone: client.phone ?? "",
    allergies: client.allergies ?? "",
    preferences: client.preferences ?? "",
    clinical_data: client.clinical_data ?? "",
    birth_date: client.birth_date ?? "",
    is_active: client.is_active
  }
}

interface Props {
  mode: ClientModalMode
  client?: Client | null
  onClose: () => void
  onSave: (client: ClientForm | Client) => void
}

export default function ClientModal({
  mode,
  client,
  onClose,
  onSave
}: Props) {
  const isView = mode === "view"

  const [form, setForm] = useState<ClientForm>(() => getInitialClientForm(mode, client))
  const [errors, setErrors] = useState<Partial<Record<keyof ClientForm, string>>>({})
  const [isClosing, setIsClosing] = useState(false)
  const closeTimerRef = useRef<number | null>(null)

  const requestClose = useCallback(() => {
    if (isClosing) return

    setIsClosing(true)
    closeTimerRef.current = window.setTimeout(() => {
      onClose()
    }, 180)
  }, [isClosing, onClose])

  const handleOverlayAnimationEnd = () => {
    if (!isClosing) return

    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }

    onClose()
  }

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        requestClose()
      }
    }

    window.addEventListener("keydown", onEscape)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", onEscape)
      document.body.style.overflow = previousOverflow
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current)
      }
    }
  }, [requestClose])

  const handleChange = (field: keyof ClientForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateFields = () => {
    const requiredFields: { field: keyof ClientForm; label: string }[] = [
      { field: "full_name", label: "Nombre completo" },
      { field: "email", label: "Correo electrónico" },
      { field: "phone", label: "Teléfono" },
      { field: "birth_date", label: "Cumpleaños" }
    ]

    const newErrors: Partial<Record<keyof ClientForm, string>> = {}

    requiredFields.forEach(({ field, label }) => {
      if (!form[field] || form[field].toString().trim() === "") {
        newErrors[field] = `Falta ${label}`
      }
    })

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateFields()) return

    if (mode === "create") {
      onSave(form) // ✅ no enviamos id
    } else if (mode === "edit" && client) {
      onSave({ ...form, id: client.id } as Client) // ✅ enviamos id solo al editar
    }
  }

  const title =
    mode === "create"
      ? "Nuevo cliente"
      : mode === "edit"
      ? "Editar cliente"
      : "Detalle cliente"

  const inputClass = (field: keyof ClientForm) =>
    `w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-[#2f271f] outline-none transition ${
      errors[field]
        ? "border-red-400 focus:ring-2 focus:ring-red-200"
        : "border-[#d8c8ab] focus:ring-2 focus:ring-[#dfcc98]"
    } ${isView ? "cursor-not-allowed bg-[#f6f1e7] text-[#85745e]" : ""}`

  const textAreaClass =
    "w-full rounded-lg border border-[#d8c8ab] bg-white px-3 py-2.5 text-sm text-[#2f271f] outline-none transition focus:ring-2 focus:ring-[#dfcc98] disabled:cursor-not-allowed disabled:bg-[#f6f1e7] disabled:text-[#85745e]"

  const saveLabel = mode === "create" ? "Registrar cliente" : "Guardar cambios"

  const modeHint =
    mode === "create"
      ? "Completa la informacion para registrar un nuevo cliente."
      : mode === "edit"
      ? "Actualiza los datos del cliente y guarda los cambios."
      : "Consulta los detalles del cliente."

  const modalWidthClass = mode === "view" ? "max-w-3xl" : "max-w-2xl"

  const stopPropagation = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#1e1810]/45 p-4 backdrop-blur-sm sm:p-6 ${
        isClosing ? "modal-overlay-exit" : "modal-overlay-enter"
      }`}
      onMouseDown={requestClose}
      onAnimationEnd={handleOverlayAnimationEnd}
      role="presentation"
    >
      <div
        className={`w-full ${modalWidthClass} overflow-hidden rounded-2xl border border-[#e5d8c2] bg-[#fffdf9] shadow-[0_20px_60px_rgba(36,24,8,0.22)] ${
          isClosing ? "modal-panel-exit" : "modal-panel-enter"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-modal-title"
        onMouseDown={stopPropagation}
      >
        <header className="border-b border-[#eee2cb] bg-[#f9f4e9] px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="client-modal-title" className="text-xl font-semibold text-[#2b2218] sm:text-2xl">
                {title}
              </h2>
              <p className="mt-1 text-sm text-[#7a684e]">{modeHint}</p>
            </div>

            <button
              type="button"
              onClick={requestClose}
              className="rounded-full border border-[#ddceb2] bg-white px-3 py-1.5 text-sm font-medium text-[#7a684e] transition hover:border-[#c9b286] hover:text-[#5d4d36]"
              aria-label="Cerrar modal"
            >
              ✕
            </button>
          </div>
        </header>

        <div className="max-h-[68vh] overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#5d4d36]">Nombre/s *</label>
              <input
                disabled={isView}
                value={form.full_name || ""}
                onChange={(e) => handleChange("full_name", e.target.value)}
                className={inputClass("full_name")}
              />
              {errors.full_name && <span className="text-xs text-red-500">{errors.full_name}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#5d4d36]">Correo electronico *</label>
              <input
                disabled={isView}
                value={form.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className={inputClass("email")}
              />
              {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#5d4d36]">Telefono *</label>
              <input
                disabled={isView}
                value={form.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                className={inputClass("phone")}
              />
              {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#5d4d36]">Cumpleanos *</label>
              <input
                disabled={isView}
                value={form.birth_date || ""}
                onChange={(e) => handleChange("birth_date", e.target.value)}
                type="date"
                className={inputClass("birth_date")}
              />
              {errors.birth_date && <span className="text-xs text-red-500">{errors.birth_date}</span>}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#5d4d36]">Alergias</label>
              <textarea
                disabled={isView}
                value={form.allergies || ""}
                onChange={(e) => handleChange("allergies", e.target.value)}
                rows={2}
                className={textAreaClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#5d4d36]">Preferencias</label>
              <textarea
                disabled={isView}
                value={form.preferences || ""}
                onChange={(e) => handleChange("preferences", e.target.value)}
                rows={2}
                className={textAreaClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#5d4d36]">Datos clinicos</label>
              <textarea
                disabled={isView}
                value={form.clinical_data || ""}
                onChange={(e) => handleChange("clinical_data", e.target.value)}
                rows={2}
                className={textAreaClass}
              />
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-[#eee2cb] bg-[#f9f4e9] px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={requestClose}
            className="rounded-full border border-[#d7c7aa] px-4 py-2 text-sm font-semibold text-[#6f5d43] transition hover:border-[#bfa476] hover:text-[#4f402e]"
          >
            {isView ? "✕" : "Cancelar"}
          </button>

          {mode !== "view" && (
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-full border border-[#b8962e] bg-[#b8962e] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#9f7f22]"
            >
              {saveLabel}
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}
