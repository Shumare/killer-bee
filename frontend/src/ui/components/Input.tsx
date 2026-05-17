type Props = {
  id?: string
  name: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'email' | 'password'
  disabled?: boolean
  className?: string
}

export default function Input({ id, name, value, onChange, placeholder, type = 'text', disabled = false, className = '' }: Props) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
