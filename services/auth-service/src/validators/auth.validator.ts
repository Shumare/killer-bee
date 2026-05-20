import type { LoginRequestDTO } from '../dto/LoginRequestDTO'

export function validateLoginRequest(body: unknown): LoginRequestDTO {
  if (typeof body !== 'object' || body === null) {
    throw Object.assign(new Error('Body invalide'), { status: 400 })
  }

  const { username, password } = body as Record<string, unknown>

  if (typeof username !== 'string' || username.trim().length === 0) {
    throw Object.assign(new Error('Nom d\'utilisateur invalide'), { status: 400 })
  }

  if (typeof password !== 'string' || password.length === 0) {
    throw Object.assign(new Error('Mot de passe requis'), { status: 400 })
  }

  return { username: username.trim(), password }
}
