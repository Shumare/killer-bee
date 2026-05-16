import { generateToken, verifyToken } from '../../utils/generateToken'

type TokenPayload = { userId: number }

export function createToken(userId: number): string {
  return generateToken({ userId })
}

export function validateToken(token: string): TokenPayload | null {
  return verifyToken(token)
}

export function extractUserId(token: string): number | null {
  const payload = verifyToken(token)
  return payload?.userId ?? null
}
