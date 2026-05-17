type Props = {
  label: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

export default function Button({ label, onClick, disabled = false, type = 'button', className = '' }: Props) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={className}>
      {label}
    </button>
  )
}
