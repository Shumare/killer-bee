import type { LoginRequestDTO } from '../dto/LoginRequestDTO'

export function validateLoginRequest(body: unknown): LoginRequestDTO {
  if (typeof body !== 'object' || body === null) {
    throw Object.assign(new Error('Body invalide'), { status: 400 })
  }

  const { email, password } = body as Record<string, unknown>

  if (typeof email !== 'string' || !email.includes('@')) {
    throw Object.assign(new Error('Email invalide'), { status: 400 })
  }

  if (typeof password !== 'string' || password.length < 6) {
    throw Object.assign(new Error('Mot de passe trop court'), { status: 400 })
  }

  return { email, password }
}
