import type { SessionEntity } from '../entities/SessionEntity'

const sessions: SessionEntity[] = []
let nextId = 1

export const SessionRepository = {
  async findByToken(token: string): Promise<SessionEntity | null> {
    return sessions.find(s => s.token === token) ?? null
  },

  async create(data: Omit<SessionEntity, 'id'>): Promise<SessionEntity> {
    const session: SessionEntity = { ...data, id: nextId++ }
    sessions.push(session)
    return session
  },

  async deleteByToken(token: string): Promise<void> {
    const index = sessions.findIndex(s => s.token === token)
    if (index !== -1) sessions.splice(index, 1)
  },
}
