import { findAllFreezebes, findFreezebeById, findFreezebesByNom, createFreezebe, updateFreezebe, deleteFreezebe } from '../mock-data/freezbe.mock'
import type { FreezebeRecord } from '../mock-data/freezbe.mock'

export const FreezebeRepository = {
  async findAll(): Promise<FreezebeRecord[]> {
    return findAllFreezebes()
  },

  async findById(id: number): Promise<FreezebeRecord | null> {
    return findFreezebeById(id)
  },

  async search(nom: string): Promise<FreezebeRecord[]> {
    return findFreezebesByNom(nom)
  },

  async create(data: Omit<FreezebeRecord, 'id'>): Promise<FreezebeRecord> {
    return createFreezebe(data)
  },

  async update(id: number, data: Partial<FreezebeRecord>): Promise<FreezebeRecord> {
    const record = updateFreezebe(id, data)
    if (!record) throw new Error('Modèle Freezbe introuvable')
    return record
  },

  async delete(id: number): Promise<void> {
    const deleted = deleteFreezebe(id)
    if (!deleted) throw new Error('Modèle Freezbe introuvable')
  },
}
