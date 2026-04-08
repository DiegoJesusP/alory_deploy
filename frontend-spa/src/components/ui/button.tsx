import type { ReactNode } from "react"

interface Props {
  children: ReactNode
  onClick?: () => void
}

export default function Button({ children, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
    >
      {children}
    </button>
  )
}