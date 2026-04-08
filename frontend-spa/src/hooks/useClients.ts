import { useEffect, useState } from "react"
import { AxiosError } from "axios"
import { toast } from "sonner"
import type { Client, CreateClientDTO } from "../types/clients.types"
import api from "./../api/axios"

type ApiResponse<T> = {
  result?: T
  text?: string
}

type ApiError = {
  message?: string
  data?: {
    message?: string
  }
}

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof AxiosError) {
    const responseData = err.response?.data as ApiError | undefined
    return responseData?.message ?? responseData?.data?.message ?? err.message ?? fallback
  }

  if (err instanceof Error) {
    return err.message
  }

  return fallback
}

const unwrapResult = <T>(payload: unknown): T | undefined => {
  if (payload && typeof payload === "object" && "result" in payload) {
    return (payload as ApiResponse<T>).result
  }

  return payload as T
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view" | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get("clients/getAllClients")
      const result = unwrapResult<Client[]>(res.data)
      setClients(Array.isArray(result) ? result : [])
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Error al obtener clientes")
      setError(message)
      toast.error("No fue posible cargar clientes", { description: message })
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setSelectedClient(null)
    setModalMode("create")
  }

  const openEdit = (client: Client) => {
    setSelectedClient(client)
    setModalMode("edit")
  }

  const openView = (client: Client) => {
    setSelectedClient(client)
    setModalMode("view")
  }

  const closeModal = () => {
    setModalMode(null)
  }

  const addClient = async (client: CreateClientDTO): Promise<boolean> => {
    try {
      setError(null)
      const res = await api.post("clients/createClient", client)
      const createdClient = unwrapResult<Client>(res.data)

      if (!createdClient) {
        setError("No se pudo leer el cliente creado")
        return false
      }

      setClients((prev) => [...prev, createdClient])
      toast.success("Cliente creado")
      return true
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Error al crear cliente")
      setError(message)
      toast.error("No se pudo crear el cliente", { description: message })
      return false
    }
  }

  const updateClient = async (client: Client): Promise<boolean> => {
    try {
      setError(null)
      const res = await api.put(`clients/updateClient/${client.id}`, client)
      const updatedClient = unwrapResult<Client>(res.data)

      if (!updatedClient) {
        setError("No se pudo leer el cliente actualizado")
        return false
      }

      setClients((prev) =>
        prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
      )
      toast.success("Cliente actualizado")
      return true
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Error al actualizar cliente")
      setError(message)
      toast.error("No se pudo actualizar el cliente", { description: message })
      return false
    }
  }

  const deleteClient = async (id: number) => {
    try {
      await api.delete(`clients/deleteClient/${id}`)
      setClients((prev) => prev.filter((c) => c.id !== id))
      toast.success("Cliente eliminado")
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Error al eliminar cliente")
      setError(message)
      toast.error("No se pudo eliminar el cliente", { description: message })
    }
  }

  return {
    clients,
    selectedClient,
    modalMode,
    loading,
    error,
    openCreate,
    openEdit,
    openView,
    closeModal,
    fetchClients,
    addClient,
    updateClient,
    deleteClient
  }
}
