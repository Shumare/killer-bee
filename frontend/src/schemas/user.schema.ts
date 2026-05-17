import type { UserResponseDTO } from '../dto/user.dto'

export function validateUserResponse(data: unknown): data is UserResponseDTO {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return (
    typeof d.user_id === 'number' &&
    typeof d.full_name === 'string' &&
    typeof d.email === 'string'
  )
}
