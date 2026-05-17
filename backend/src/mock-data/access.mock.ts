import type { Role } from '../security/access-control/rbac'

type AccessRecord = {
  userId: number
  role: Role
  allowedPaths: string[]
}

const accessRules: AccessRecord[] = [
  { userId: 1, role: 'admin', allowedPaths: ['*'] },
  { userId: 2, role: 'user', allowedPaths: ['/api/freezbe', '/api/processes'] },
]

export function findAccessByUserId(userId: number): AccessRecord | null {
  return accessRules.find(a => a.userId === userId) ?? null
}

export function getRoleForUser(userId: number): Role {
  return accessRules.find(a => a.userId === userId)?.role ?? 'guest'
}

export function canUserAccessPath(userId: number, path: string): boolean {
  const record = findAccessByUserId(userId)
  if (!record) return false
  if (record.allowedPaths.includes('*')) return true
  return record.allowedPaths.some(p => path.startsWith(p))
}
