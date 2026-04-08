import { useMemo, useState } from "react"

import Button from "./../../components/ui/button"
import SearchInput from "./../../components/ui/SearchInput"

import ClientList from "./../../components/clients/ClientList"
import ClientModal from "./../../components/clients/ClientModal"

import { useClients } from "./../../hooks/useClients"
import type { Client, CreateClientDTO } from "./../../types/clients.types"
import DashboardLayout from "@/components/Layout/DashboardLayout"

type ClientSavePayload = CreateClientDTO | Client

export default function ClientsPage() {
  const [search, setSearch] = useState("")

  const {
    clients,
    selectedClient,
    modalMode,
    error,
    openCreate,
    openEdit,
    openView,
    closeModal,
    addClient,
    updateClient,
    deleteClient
  } = useClients()

  const filteredClients = clients.filter((client) => {
    const searchLower = search.toLowerCase()
    return (
      client.full_name.toLowerCase().includes(searchLower) ||
      (client.email?.toLowerCase() || "").includes(searchLower) ||
      (client.phone?.toLowerCase() || "").includes(searchLower)
    )
  })

  const activeClients = useMemo(
    () => clients.filter((client) => client.is_active).length,
    [clients]
  )

  const handleSave = async (client: ClientSavePayload) => {
    let wasSaved = false

    if (modalMode === "create" && !("id" in client)) {
      wasSaved = await addClient(client)
    }

    if (modalMode === "edit" && "id" in client) {
      wasSaved = await updateClient(client)
    }

    if (wasSaved) {
      closeModal()
    }
  }

  return (
    <DashboardLayout>
      <div className="mt-3 pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-[#2b2218]">
              Gestión de Clientes
            </h2>

            <p className="mt-1 text-base text-[#7a684e]">
              Administra la información de tus clientes
            </p>

            <div className="mt-3 inline-flex items-center rounded-full border border-[#e8dcc8] bg-white px-4 py-1.5 text-sm font-medium text-[#5d4d36]">
              Activos: <span className="ml-1 font-semibold text-[#2f271f]">{activeClients}</span>
              <span className="mx-2 text-[#ccb991]">|</span>
              Totales: <span className="ml-1 font-semibold text-[#2f271f]">{clients.length}</span>
            </div>
          </div>

          <Button onClick={openCreate}>
            + Nuevo Cliente
          </Button>
        </div>

        <div className="mt-6">
          <SearchInput
            value={search}
            onChange={setSearch}
          />
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <ClientList
          clients={filteredClients}
          onView={openView}
          onEdit={openEdit}
          onDelete={deleteClient}
        />
      </div>

      {modalMode && (
        <ClientModal
          key={`${modalMode}-${selectedClient?.id ?? "new"}`}
          mode={modalMode}
          client={selectedClient}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </DashboardLayout>
  )
}
