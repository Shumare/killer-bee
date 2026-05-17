export type Role = 'admin' | 'user' | 'guest'

type Permission = 'read' | 'write' | 'delete' | 'admin'

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ['read', 'write', 'delete', 'admin'],
  user: ['read', 'write'],
  guest: ['read'],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function canWrite(role: Role): boolean {
  return hasPermission(role, 'write')
}

export function canDelete(role: Role): boolean {
  return hasPermission(role, 'delete')
}

export function isAdmin(role: Role): boolean {
  return role === 'admin'
}
