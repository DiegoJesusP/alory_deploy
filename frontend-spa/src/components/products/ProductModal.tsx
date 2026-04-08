import { useCallback, useEffect, useRef, useState } from "react"
import type { Product } from "../../types/products.type"
import type { ProductModalMode } from "../../types/modal.types"

type ProductForm = Omit<Product, "id" | "created_at">
const EMPTY_PRODUCT_FORM: ProductForm = {
  name: "",
  unit: "",
  cost: 0,
  price: 0,
  quantity: 0,
  minimum_stock: 0,
  is_active: true
}

const getInitialProductForm = (
  mode: ProductModalMode,
  product?: Product | null
): ProductForm => {
  if (mode === "create" || !product) {
    return EMPTY_PRODUCT_FORM
  }

  return {
    name: product.name,
    unit: product.unit,
    cost: product.cost,
    price: product.price,
    quantity: product.quantity,
    minimum_stock: product.minimum_stock,
    is_active: product.is_active
  }
}

interface Props {
  mode: ProductModalMode
  product?: Product | null
  onClose: () => void
  onSave: (product: ProductForm | Product) => void
}

export default function ProductModal({
  mode,
  product,
  onClose,
  onSave
}: Props) {
  const isView = mode === "view"

  const [form, setForm] = useState<ProductForm>(() => getInitialProductForm(mode, product))

  const [errors, setErrors] = useState<Partial<Record<keyof ProductForm, string>>>({})
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

  const handleChange = (field: keyof ProductForm, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateFields = () => {
    const newErrors: Partial<Record<keyof ProductForm, string>> = {}

    if (!form.name.trim()) newErrors.name = "Falta Nombre"
    if (!form.unit.trim()) newErrors.unit = "Falta Unidad"

    if (!Number.isFinite(form.cost) || form.cost < 0) {
      newErrors.cost = "Ingresa un costo valido"
    }

    if (!Number.isFinite(form.price) || form.price < 0) {
      newErrors.price = "Ingresa un precio valido"
    }

    if (!Number.isFinite(form.quantity) || form.quantity < 0) {
      newErrors.quantity = "Cantidad invalida"
    }

    if (!Number.isFinite(form.minimum_stock) || form.minimum_stock < 0) {
      newErrors.minimum_stock = "Stock minimo invalido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateFields()) return

    if (mode === "create") {
      onSave(form)
    } else if (mode === "edit" && product) {
      onSave({ ...form, id: product.id } as Product)
    }
  }

  const title =
    mode === "create"
      ? "Nuevo producto"
      : mode === "edit"
      ? "Editar producto"
      : "Detalle producto"

  const modeHint =
    mode === "create"
      ? "Completa la informacion para registrar un nuevo producto."
      : mode === "edit"
      ? "Actualiza los datos del producto y guarda los cambios."
      : "Consulta los detalles del producto."

  const parseNumber = (value: string) => {
    if (value.trim() === "") return Number.NaN
    return Number(value)
  }

  const inputClass = (field: keyof ProductForm) =>
    `w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-[#2f271f] outline-none transition ${
      errors[field]
        ? "border-red-400 focus:ring-2 focus:ring-red-200"
        : "border-[#d8c8ab] focus:ring-2 focus:ring-[#dfcc98]"
    } ${isView ? "cursor-not-allowed bg-[#f6f1e7] text-[#85745e]" : ""}`

  const saveLabel = mode === "create" ? "Registrar producto" : "Guardar cambios"

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
        className={`w-full max-w-4xl overflow-hidden rounded-2xl border border-[#e5d8c2] bg-[#fffdf9] shadow-[0_20px_60px_rgba(36,24,8,0.22)] ${
          isClosing ? "modal-panel-exit" : "modal-panel-enter"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        onMouseDown={stopPropagation}
      >
        <header className="border-b border-[#eee2cb] bg-[#f9f4e9] px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="product-modal-title" className="text-xl font-semibold text-[#2b2218] sm:text-2xl">
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

        <div className="max-h-[72vh] overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#5d4d36]">Nombre *</label>
              <input
                disabled={isView}
                value={form.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                className={inputClass("name")}
              />
              {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#5d4d36]">Unidad *</label>
              <input
                disabled={isView}
                value={form.unit || ""}
                onChange={(e) => handleChange("unit", e.target.value)}
                className={inputClass("unit")}
              />
              {errors.unit && <span className="text-xs text-red-500">{errors.unit}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#5d4d36]">Costo *</label>
              <input
                disabled={isView}
                type="number"
                min={0}
                step="0.01"
                value={Number.isFinite(form.cost) ? form.cost : ""}
                onChange={(e) => handleChange("cost", parseNumber(e.target.value))}
                className={inputClass("cost")}
              />
              {errors.cost && <span className="text-xs text-red-500">{errors.cost}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#5d4d36]">Precio *</label>
              <input
                disabled={isView}
                type="number"
                min={0}
                step="0.01"
                value={Number.isFinite(form.price) ? form.price : ""}
                onChange={(e) => handleChange("price", parseNumber(e.target.value))}
                className={inputClass("price")}
              />
              {errors.price && <span className="text-xs text-red-500">{errors.price}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#5d4d36]">Cantidad</label>
              <input
                disabled={isView}
                type="number"
                min={0}
                step="1"
                value={Number.isFinite(form.quantity) ? form.quantity : ""}
                onChange={(e) => handleChange("quantity", parseNumber(e.target.value))}
                className={inputClass("quantity")}
              />
              {errors.quantity && <span className="text-xs text-red-500">{errors.quantity}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#5d4d36]">Stock minimo</label>
              <input
                disabled={isView}
                type="number"
                min={0}
                step="1"
                value={Number.isFinite(form.minimum_stock) ? form.minimum_stock : ""}
                onChange={(e) => handleChange("minimum_stock", parseNumber(e.target.value))}
                className={inputClass("minimum_stock")}
              />
              {errors.minimum_stock && <span className="text-xs text-red-500">{errors.minimum_stock}</span>}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#e5d8c2] bg-[#f9f4e9] p-3">
            <label className="text-sm font-semibold text-[#5d4d36]">Producto activo</label>
            <input
              disabled={isView}
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => handleChange("is_active", e.target.checked)}
              className="h-5 w-5 accent-[#b8962e]"
            />
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
