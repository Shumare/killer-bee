import { useToast } from '../../store/toast.store'

export default function ToastContainer() {
  const { toasts, dismiss } = useToast()
  if (!toasts.length) return null

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => dismiss(t.id)} role="alert">
          <span className="toast-icon">
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  )
}
