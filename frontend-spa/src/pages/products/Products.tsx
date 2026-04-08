import { useMemo, useState } from "react"

import Button from "../../components/ui/button"
import SearchInput from "../../components/ui/SearchInput"

import ProductList from "../../components/products/ProductsList"
import ProductModal from "../../components/products/ProductModal"

import { useProducts } from "../../hooks/useProducts"
import type { CreateProductDTO, Product } from "../../types/products.type"
import DashboardLayout from "@/components/Layout/DashboardLayout"

type ProductSavePayload = CreateProductDTO | Product

export default function ProductsPage() {
  const [search, setSearch] = useState("")

  const {
    products,
    selectedProduct,
    modalMode,
    error,
    openCreate,
    openEdit,
    openView,
    closeModal,
    addProduct,
    updateProduct,
    deleteProduct
  } = useProducts()

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  )

  const activeProducts = useMemo(
    () => products.filter((product) => product.is_active).length,
    [products]
  )

  const handleSave = async (product: ProductSavePayload) => {
    let wasSaved = false

    if (modalMode === "create" && !("id" in product)) {
      wasSaved = await addProduct(product)
    } else if (modalMode === "edit" && "id" in product) {
      wasSaved = await updateProduct(product)
    }

    if (wasSaved) {
      closeModal()
    }
  }

  return (
    <DashboardLayout>
      <div className="mt-3 pb-8">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-[#2b2218]">Gestión de Productos</h2>
            <p className="mt-1 text-base text-[#7a684e]">
              Administra la información del inventario de tus productos
            </p>

            <div className="mt-3 inline-flex items-center rounded-full border border-[#e8dcc8] bg-white px-4 py-1.5 text-sm font-medium text-[#5d4d36]">
              Activos: <span className="ml-1 font-semibold text-[#2f271f]">{activeProducts}</span>
              <span className="mx-2 text-[#ccb991]">|</span>
              Totales: <span className="ml-1 font-semibold text-[#2f271f]">{products.length}</span>
            </div>
          </div>

          <Button onClick={openCreate}>+ Nuevo Producto</Button>
        </div>

        {/* Buscador */}
        <div className="mt-6">
          <SearchInput value={search} onChange={setSearch} />
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Lista de productos */}
        <ProductList
          products={filteredProducts}
          onView={openView}
          onEdit={openEdit}
          onDelete={deleteProduct}
        />
      </div>

      {/* Modal de productos */}
      {modalMode && (
        <ProductModal
          key={`${modalMode}-${selectedProduct?.id ?? "new"}`}
          mode={modalMode}
          product={selectedProduct}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </DashboardLayout>
  )
}
