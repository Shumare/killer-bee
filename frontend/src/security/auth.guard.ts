import type { User } from '../models/User'

export type Role = 'admin' | 'user' | 'guest'

export function canAccess(user: User | null, requiredRole: Role): boolean {
  if (!user) return requiredRole === 'guest'
  return true
}

export function isAuthorized(user: User | null, allowedRoles: Role[]): boolean {
  const role: Role = user ? 'user' : 'guest'
  return allowedRoles.includes(role)
}
