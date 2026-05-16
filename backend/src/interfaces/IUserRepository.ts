import type { UserEntity } from '../entities/UserEntity'

export interface IUserRepository {
  findById(id: number): Promise<UserEntity | null>
  findByEmail(email: string): Promise<UserEntity | null>
  update(id: number, data: Partial<UserEntity>): Promise<UserEntity>
  create(data: Omit<UserEntity, 'id'>): Promise<UserEntity>
}
