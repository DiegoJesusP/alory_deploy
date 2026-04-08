import type { Product } from "../../types/products.type"
import ProductCard from "./ProductCard"

interface Props {
  products: Product[]
  onView: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (id: number) => void
}

export default function ProductList({
  products,
  onView,
  onEdit,
  onDelete
}: Props) {

  if (!products || products.length === 0) {
    return <p className="mt-4 text-gray-500">No hay productos disponibles.</p>
  }

  return (
    <div
      className="grid gap-3 mt-6
                 grid-cols-1
                 md:grid-cols-2
                 xl:grid-cols-3"
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}