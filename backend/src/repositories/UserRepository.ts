import type { UserEntity } from '../entities/UserEntity'
import { findUserById, findUserByEmail, createUser, updateUser } from '../mock-data/user.mock'

export const UserRepository = {
  async findById(id: number): Promise<UserEntity | null> {
    return findUserById(id)
  },

  async findByEmail(email: string): Promise<UserEntity | null> {
    return findUserByEmail(email)
  },

  async update(id: number, data: Partial<UserEntity>): Promise<UserEntity> {
    const entity = updateUser(id, data)
    if (!entity) throw new Error('Utilisateur introuvable')
    return entity
  },

  async create(data: Omit<UserEntity, 'id'>): Promise<UserEntity> {
    return createUser(data)
  },
}
