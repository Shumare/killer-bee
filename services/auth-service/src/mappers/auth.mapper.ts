import type { LoginResponseDTO } from '../dto/LoginResponseDTO'
import type { UserEntity } from '../entities/UserEntity'

export function mapUserToLoginResponse(user: UserEntity, token: string): LoginResponseDTO {
  return {
    access_token: token,
    user_id: user.id,
    full_name: user.full_name,
  }
}
