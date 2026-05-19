import { createContext, useContext, useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastStore {
  toasts: Toast[]
  notify: (message: string, type?: ToastType) => void
  dismiss: (id: number) => void
}

export const ToastContext = createContext<ToastStore>({
  toasts: [],
  notify: () => {},
  dismiss: () => {},
})

let nextId = 0

export function useToastState(): ToastStore {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = ++nextId
      setToasts((prev) => [...prev.slice(-4), { id, message, type }])
      setTimeout(() => dismiss(id), 3500)
    },
    [dismiss],
  )

  return { toasts, notify, dismiss }
}

export function useToast() {
  return useContext(ToastContext)
}
