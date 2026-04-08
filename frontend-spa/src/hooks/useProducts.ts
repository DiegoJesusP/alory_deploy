import { useEffect, useState } from "react"
import { AxiosError } from "axios"
import { toast } from "sonner"
import type { Product, CreateProductDTO } from "../types/products.type"
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

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view" | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get("products/getAll?page=1&size=200")
      const result = unwrapResult<Product[]>(res.data)
      setProducts(Array.isArray(result) ? result : [])
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Error al obtener productos")
      setError(message)
      toast.error("No fue posible cargar productos", { description: message })
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setSelectedProduct(null)
    setModalMode("create")
  }

  const openEdit = (product: Product) => {
    setSelectedProduct(product)
    setModalMode("edit")
  }

  const openView = (product: Product) => {
    setSelectedProduct(product)
    setModalMode("view")
  }

  const closeModal = () => {
    setModalMode(null)
  }

  const addProduct = async (product: CreateProductDTO): Promise<boolean> => {
    try {
      setError(null)
      const res = await api.post("products/createProduct", product)
      const createdProduct = unwrapResult<Product>(res.data)

      if (!createdProduct) {
        setError("No se pudo leer el producto creado")
        return false
      }

      setProducts((prev) => [createdProduct, ...prev])
      toast.success("Producto creado")
      return true
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Error al crear producto")
      setError(message)
      toast.error("No se pudo crear el producto", { description: message })
      return false
    }
  }

  const updateProduct = async (product: Product): Promise<boolean> => {
    try {
      setError(null)
      const res = await api.put(`products/updateProduct/${product.id}`, product)
      const updatedProduct = unwrapResult<Product>(res.data)

      if (!updatedProduct) {
        setError("No se pudo leer el producto actualizado")
        return false
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      )
      toast.success("Producto actualizado")
      return true
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Error al actualizar producto")
      setError(message)
      toast.error("No se pudo actualizar el producto", { description: message })
      return false
    }
  }

  const deleteProduct = async (id: number) => {
    try {
      await api.delete(`products/deleteProduct/${id}`)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      toast.success("Producto eliminado")
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Error al eliminar producto")
      setError(message)
      toast.error("No se pudo eliminar el producto", { description: message })
    }
  }

  return {
    products,
    selectedProduct,
    modalMode,
    loading,
    error,
    openCreate,
    openEdit,
    openView,
    closeModal,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct
  }
}
