import type { User } from '../models/User'
import { UserRepository } from '../repositories/UserRepository'
import { mapEntityToUser } from '../mappers/user.mapper'

export const UserService = {
  async getUser(id: number): Promise<User> {
    const entity = await UserRepository.findById(id)
    if (!entity) throw new Error('Utilisateur introuvable')
    return mapEntityToUser(entity)
  },

  async updateProfile(id: number, data: Partial<Pick<User, 'name' | 'email'>>): Promise<User> {
    const entity = await UserRepository.update(id, data)
    return mapEntityToUser(entity)
  },
}
