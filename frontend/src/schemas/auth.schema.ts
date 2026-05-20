import type { LoginResponseDTO } from '../dto/auth.dto'

export function validateLoginResponse(data: unknown): data is LoginResponseDTO {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return (
    typeof d.access_token === 'string' &&
    typeof d.full_name === 'string' &&
    typeof d.username === 'string'
  )
}
