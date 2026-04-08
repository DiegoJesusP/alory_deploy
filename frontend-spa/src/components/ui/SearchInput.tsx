interface Props {
  value: string
  onChange: (value: string) => void
}

export default function SearchInput({ value, onChange }: Props) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Buscar..."
      className="w-full bg-neutral-100 rounded-lg px-4 py-3 outline-none"
    />
  )
}