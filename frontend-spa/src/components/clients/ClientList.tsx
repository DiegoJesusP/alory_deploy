import type { Client } from "./../../types/clients.types"
import ClientCard from "./ClientCard"

interface Props {
  clients: Client[]
  onView: (client: Client) => void
  onEdit: (client: Client) => void
  onDelete: (id: number) => void
}

export default function ClientList({
  clients,
  onView,
  onEdit,
  onDelete
}: Props) {

  if (!clients || clients.length === 0) {
    return <p className="mt-4 text-gray-500">No hay clientes disponibles.</p>
  }

  return (
    <div
      className="grid gap-3 mt-6
      grid-cols-1
      md:grid-cols-2
      xl:grid-cols-3"
    >

      {clients.map((client) => (
        <ClientCard
          key={client.id}
          client={client}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

    </div>
  )
}