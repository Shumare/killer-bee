import { JWT_SECRET, JWT_EXPIRATION } from '../config/jwt'

type TokenPayload = {
  userId: number
}

export function generateToken(payload: TokenPayload): string {
  // Remplacer par jsonwebtoken lors de l'intégration
  const encoded = Buffer.from(JSON.stringify({ ...payload, exp: JWT_EXPIRATION })).toString('base64')
  return `${encoded}.${JWT_SECRET}`
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const [encoded] = token.split('.')
    return JSON.parse(Buffer.from(encoded, 'base64').toString()) as TokenPayload
  } catch {
    return null
  }
}
