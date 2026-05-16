import { createContext, useContext, useState } from 'react'

export type Page = 'dashboard' | 'freezbe' | 'ingredients' | 'processes' | 'profile'

type RouterState = {
  currentPage: Page
  navigate: (page: Page) => void
}

export const RouterContext = createContext<RouterState | null>(null)

export function useRouter(): RouterState {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter must be used inside RouterProvider')
  return ctx
}

export function useRouterState() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  return { currentPage, navigate: setCurrentPage }
}
