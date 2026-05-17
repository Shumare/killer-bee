export function validateUpdateProfile(body: unknown): { name?: string; email?: string } {
  if (typeof body !== 'object' || body === null) {
    throw Object.assign(new Error('Body invalide'), { status: 400 })
  }

  const { name, email } = body as Record<string, unknown>
  const result: { name?: string; email?: string } = {}

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw Object.assign(new Error('Nom invalide'), { status: 400 })
    }
    result.name = name.trim()
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || !email.includes('@')) {
      throw Object.assign(new Error('Email invalide'), { status: 400 })
    }
    result.email = email
  }

  return result
}
