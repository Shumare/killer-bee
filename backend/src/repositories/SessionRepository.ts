import type { SessionEntity } from '../entities/SessionEntity'

export const SessionRepository = {
  async findByToken(token: string): Promise<SessionEntity | null> {
    // Connexion DB à implémenter
    throw new Error('Not implemented')
  },

  async create(data: Omit<SessionEntity, 'id'>): Promise<SessionEntity> {
    // Connexion DB à implémenter
    throw new Error('Not implemented')
  },

  async deleteByToken(token: string): Promise<void> {
    // Connexion DB à implémenter
    throw new Error('Not implemented')
  },
}
