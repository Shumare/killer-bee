import type { UserEntity } from '../entities/UserEntity'
import type { User } from '../models/User'

export function mapEntityToUser(entity: UserEntity): User {
  return {
    id: entity.id,
    name: entity.full_name,
    email: entity.email,
    password: entity.password,
  }
}
