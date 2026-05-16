type Props = {
  name: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'email' | 'password'
  disabled?: boolean
}

export default function Input({ name, value, onChange, placeholder, type = 'text', disabled = false }: Props) {
  return (
    <input
      name={name}
      type={type}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
