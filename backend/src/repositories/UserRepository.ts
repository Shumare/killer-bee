import type { UserEntity } from '../entities/UserEntity'

export const UserRepository = {
  async findById(id: number): Promise<UserEntity | null> {
    // Connexion DB à implémenter
    throw new Error('Not implemented')
  },

  async findByEmail(email: string): Promise<UserEntity | null> {
    // Connexion DB à implémenter
    throw new Error('Not implemented')
  },

  async update(id: number, data: Partial<UserEntity>): Promise<UserEntity> {
    // Connexion DB à implémenter
    throw new Error('Not implemented')
  },

  async create(data: Omit<UserEntity, 'id'>): Promise<UserEntity> {
    // Connexion DB à implémenter
    throw new Error('Not implemented')
  },
}
