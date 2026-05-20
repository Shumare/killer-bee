import type { LoginResponseDTO } from '../dto/LoginResponseDTO'
import type { UserEntity } from '../entities/UserEntity'

export function mapUserToLoginResponse(user: UserEntity, token: string, username: string): LoginResponseDTO {
  return {
    access_token: token,
    full_name: user.full_name,
    username,
  }
}
