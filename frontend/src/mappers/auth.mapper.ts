import type { LoginResponseDTO } from '../dto/auth.dto'
import type { Session } from '../models/Session'
import type { User } from '../models/User'

export function mapLoginResponseToUser(dto: LoginResponseDTO): User {
  return {
    id: dto.username,
    name: dto.full_name,
    email: '',
  }
}

export function mapLoginResponseToSession(dto: LoginResponseDTO): Session {
  return {
    token: dto.access_token,
    userId: dto.username,
  }
}
