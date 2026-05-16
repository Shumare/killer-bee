type Props = {
  label: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export default function Button({ label, onClick, disabled = false, type = 'button' }: Props) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
}
