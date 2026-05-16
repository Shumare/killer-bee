import type { CreateProcessDTO, UpdateProcessDTO, ProcessResponseDTO } from '../dto/ProcessDTO'
import { ProcessRepository } from '../repositories/ProcessRepository'
import { FreezebeRepository } from '../repositories/FreezebeRepository'
import { mapRecordToProcess, mapProcessToResponse } from '../mappers/process.mapper'

export const ProcessService = {
  async listAll(): Promise<ProcessResponseDTO[]> {
    const records = await ProcessRepository.findAll()
    return records.map(r => mapProcessToResponse(mapRecordToProcess(r)))
  },

  async getById(id: number): Promise<ProcessResponseDTO> {
    const record = await ProcessRepository.findById(id)
    if (!record) throw Object.assign(new Error('Procédé introuvable'), { status: 404 })
    return mapProcessToResponse(mapRecordToProcess(record))
  },

  async create(dto: CreateProcessDTO): Promise<ProcessResponseDTO> {
    const freezbe = await FreezebeRepository.findById(dto.freezbeId)
    if (!freezbe) throw Object.assign(new Error('Modèle Freezbe associé introuvable'), { status: 400 })

    const record = await ProcessRepository.create(dto)
    return mapProcessToResponse(mapRecordToProcess(record))
  },

  async update(id: number, dto: UpdateProcessDTO): Promise<ProcessResponseDTO> {
    const record = await ProcessRepository.update(id, dto)
    return mapProcessToResponse(mapRecordToProcess(record))
  },

  async search(nom: string): Promise<ProcessResponseDTO[]> {
    const records = await ProcessRepository.search(nom)
    return records.map(r => mapProcessToResponse(mapRecordToProcess(r)))
  },

  async delete(id: number): Promise<void> {
    await ProcessRepository.delete(id)
  },
}
