import { createContext, useContext, useState } from 'react'

type AppState = {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export const AppContext = createContext<AppState | null>(null)

export function useAppStore(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppStore must be used inside AppProvider')
  return ctx
}

export function useAppState() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  function toggleTheme() {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return { theme, toggleTheme }
}
