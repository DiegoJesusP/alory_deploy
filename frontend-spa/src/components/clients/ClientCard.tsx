import type { Client } from "./../../types/clients.types"
import ClientActions from "./ClientActions"

interface Props {
  client: Client
  onView: (client: Client) => void
  onEdit: (client: Client) => void
  onDelete: (id: number) => void
}

export default function ClientCard({
  client,
  onView,
  onEdit,
  onDelete
}: Props) {

  const showField = (value?: string) =>
    value && value.trim() !== "" ? value : "—"

  const isActive = client.is_active

  // Detectar cumpleaños
  const isBirthdayToday = (birthDate?: string) => {
    if (!birthDate) return false

    const today = new Date()
    const birth = new Date(birthDate)

    return (
      today.getDate() === birth.getDate() &&
      today.getMonth() === birth.getMonth()
    )
  }

  const isBirthday = isBirthdayToday(client.birth_date)

  return (
    <article className="rounded-xl border border-[#f0e6d6] bg-[#fdfaf4] p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-2xl font-semibold leading-[1.15] text-[#2f271f] [font-family:var(--font-spa-display)]">
          {client.full_name}
        </p>
        <div className="flex items-center gap-1.5">
          {isBirthday && (
            <span className="rounded-full bg-pink-100 px-2 py-0.5 text-sm font-semibold text-pink-700">
              Cumple
            </span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
            }`}
          >
            {isActive ? "Activo" : "Inactivo"}
          </span>
        </div>
      </div>

      <p className="mt-2 text-base font-medium text-[#7d6a4d] [font-family:var(--font-spa-body)]">Correo: {showField(client.email)}</p>
      <p className="text-base font-medium text-[#7d6a4d] [font-family:var(--font-spa-body)]">Telefono: {showField(client.phone)}</p>
      <p className="mt-1 text-base font-semibold tracking-tight text-[#6f5632] [font-family:var(--font-spa-body)]">Alergias: {showField(client.allergies)}</p>
      <p className="text-base text-[#8a7759] [font-family:var(--font-spa-body)]">Preferencias: {showField(client.preferences)}</p>

      <ClientActions
        client={client}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </article>
  )
}