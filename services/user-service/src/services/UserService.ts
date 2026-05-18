import type { User } from '../models/User'
import { UserRepository } from '../repositories/UserRepository'
import { mapEntityToUser } from '../mappers/user.mapper'
import { log } from '../utils/logger'

export const UserService = {
  async getUser(id: number): Promise<User> {
    log.debug(`UserRepository.findById(${id})`, { category: 'operation', id })
    const entity = await UserRepository.findById(id)
    if (!entity) {
      log.warn(`Utilisateur #${id} introuvable`, { category: 'operation', id })
      throw new Error('Utilisateur introuvable')
    }
    return mapEntityToUser(entity)
  },

  async updateProfile(id: number, data: Partial<Pick<User, 'name' | 'email'>>): Promise<User> {
    log.debug(`UserRepository.update(${id})`, { category: 'operation', id, fields: Object.keys(data) })
    const entity = await UserRepository.update(id, data)
    log.info(`Profil utilisateur #${id} persisté`, { category: 'operation', id })
    return mapEntityToUser(entity)
  },
}
