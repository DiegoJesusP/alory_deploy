import type { Product } from "../../types/products.type"
import ProductActions from "./ProductsActions"

interface Props {
  product: Product
  onView: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (id: number) => void
}

export default function ProductCard({
  product,
  onView,
  onEdit,
  onDelete
}: Props) {

  const showField = (value?: string | number) =>
    value !== undefined && value !== null && value !== "" ? value : "—"

  const isActive = product.is_active

  // Detectar stock bajo
  const isLowStock = product.quantity <= product.minimum_stock

  return (
    <article className="rounded-xl border border-[#f0e6d6] bg-[#fdfaf4] p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-2xl font-semibold leading-[1.15] text-[#2f271f] [font-family:var(--font-spa-display)]">
          {product.name}
        </p>
        <div className="flex items-center gap-1.5">
          {isLowStock && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-sm font-semibold text-red-700">
              Stock bajo
            </span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-sm font-semibold ${
              isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
            }`}
          >
            {isActive ? "Activo" : "Inactivo"}
          </span>
        </div>
      </div>

      <p className="mt-2 text-base font-medium text-[#7d6a4d] [font-family:var(--font-spa-body)]">Unidad: {showField(product.unit)}</p>
      <p className="text-base font-medium text-[#7d6a4d] [font-family:var(--font-spa-body)]">Costo: ${showField(product.cost)}</p>
      <p className="text-xl font-semibold tracking-tight text-[#6f5632] [font-family:var(--font-spa-body)]">Precio: ${showField(product.price)}</p>
      <p className="text-base font-medium text-[#8a7759] [font-family:var(--font-spa-body)]">Cantidad: {showField(product.quantity)}</p>

      <ProductActions
        product={product}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </article>
  )
}