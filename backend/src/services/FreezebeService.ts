import type { CreateFreezebeDTO, UpdateFreezebeDTO, FreezebeResponseDTO } from '../dto/FreezebeDTO'
import { FreezebeRepository } from '../repositories/FreezebeRepository'
import { mapRecordToFreezebe, mapFreezebeToResponse } from '../mappers/freezbe.mapper'

export const FreezebeService = {
  async listAll(): Promise<FreezebeResponseDTO[]> {
    const records = await FreezebeRepository.findAll()
    return records.map(r => mapFreezebeToResponse(mapRecordToFreezebe(r)))
  },

  async getById(id: number): Promise<FreezebeResponseDTO> {
    const record = await FreezebeRepository.findById(id)
    if (!record) throw Object.assign(new Error('Modèle Freezbe introuvable'), { status: 404 })
    return mapFreezebeToResponse(mapRecordToFreezebe(record))
  },

  async search(nom: string): Promise<FreezebeResponseDTO[]> {
    const records = await FreezebeRepository.search(nom)
    return records.map(r => mapFreezebeToResponse(mapRecordToFreezebe(r)))
  },

  async create(dto: CreateFreezebeDTO): Promise<FreezebeResponseDTO> {
    const record = await FreezebeRepository.create({ ...dto })
    return mapFreezebeToResponse(mapRecordToFreezebe(record))
  },

  async update(id: number, dto: UpdateFreezebeDTO): Promise<FreezebeResponseDTO> {
    const record = await FreezebeRepository.update(id, dto)
    return mapFreezebeToResponse(mapRecordToFreezebe(record))
  },

  async delete(id: number): Promise<void> {
    await FreezebeRepository.delete(id)
  },
}
