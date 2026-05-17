import { createContext, useContext, useState } from 'react'
import type { Session } from '../models/Session'
import type { User } from '../models/User'
import { setToken } from '../security/token.registry'

type AuthState = {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuthStore(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthStore must be used inside AuthProvider')
  return ctx
}

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const isAuthenticated = session !== null

  function handleSetSession(s: Session | null) {
    setToken(s?.token ?? null)
    setSession(s)
  }

  return { user, session, isAuthenticated, setUser, setSession: handleSetSession }
}
