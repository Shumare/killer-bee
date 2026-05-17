import { createHash } from 'crypto'

export function hashPassword(password: string): string {
  // Remplacer par bcrypt lors de l'intégration DB
  return createHash('sha256').update(password).digest('hex')
}

export function comparePassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}
