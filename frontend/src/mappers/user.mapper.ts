import type { UserResponseDTO } from '../dto/user.dto'
import type { User } from '../models/User'

export function mapUserResponseToUser(dto: UserResponseDTO): User {
  return {
    id: dto.user_id,
    name: dto.full_name,
    email: dto.email,
  }
}
