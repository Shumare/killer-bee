import { findAllProcesses, findProcessById, findProcessesByFreezebeId, createProcess, updateProcess, deleteProcess } from '../mock-data/process.mock'
import type { ProcessRecord } from '../mock-data/process.mock'

export const ProcessRepository = {
  async findAll(): Promise<ProcessRecord[]> {
    return findAllProcesses()
  },

  async findById(id: number): Promise<ProcessRecord | null> {
    return findProcessById(id)
  },

  async findByFreezebeId(freezbeId: number): Promise<ProcessRecord[]> {
    return findProcessesByFreezebeId(freezbeId)
  },

  async create(data: Omit<ProcessRecord, 'id'>): Promise<ProcessRecord> {
    return createProcess(data)
  },

  async update(id: number, data: Partial<ProcessRecord>): Promise<ProcessRecord> {
    const record = updateProcess(id, data)
    if (!record) throw new Error('Procédé introuvable')
    return record
  },

  async delete(id: number): Promise<void> {
    const deleted = deleteProcess(id)
    if (!deleted) throw new Error('Procédé introuvable')
  },
}
