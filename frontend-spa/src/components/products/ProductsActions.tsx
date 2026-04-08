import { Pencil, Trash2, Info } from "lucide-react";

import type { Product } from "../../types/products.type"

interface Props {
  product: Product
  onView: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (id: number) => void
}

export default function ProductActions({
    product,
    onView,
    onEdit,
    onDelete
  }: Props) {
  return (
    <div className="mt-3 flex gap-2">

      <button
        className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
        onClick={() => onView(product)}
      >
        <span className="inline-flex items-center gap-1"><Info size={14} /> Ver</span>
      </button>

      <button
        className="rounded-full border border-[#d7c7aa] bg-white px-3 py-1 text-sm font-medium text-[#6f5d43] transition hover:border-[#bfa476]"
        onClick={() => onEdit(product)}
      >
        <span className="inline-flex items-center gap-1"><Pencil size={14} /> Editar</span>
      </button>

      <button
        className="rounded-full border border-rose-300 px-3 py-1 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
        onClick={() => onDelete(product.id)}
      >
        <span className="inline-flex items-center gap-1"><Trash2 size={14} /> Eliminar</span>
      </button>

    </div>
  );
}
