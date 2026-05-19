import type { CreateFreezebeDTO, UpdateFreezebeDTO, FreezebeResponseDTO } from '../dto/FreezebeDTO'
import { FreezebeRepository } from '../repositories/FreezebeRepository'
import { mapRecordToFreezebe, mapFreezebeToResponse } from '../mappers/freezbe.mapper'
import { log } from '../utils/logger'

export const FreezebeService = {
  async listAll(): Promise<FreezebeResponseDTO[]> {
    log.debug('FreezebeRepository.findAll()', { category: 'operation' })
    const records = await FreezebeRepository.findAll()
    return records.map(r => mapFreezebeToResponse(mapRecordToFreezebe(r)))
  },

  async getById(id: number): Promise<FreezebeResponseDTO> {
    log.debug(`FreezebeRepository.findById(${id})`, { category: 'operation', id })
    const record = await FreezebeRepository.findById(id)
    if (!record) {
      log.warn(`Modèle Freezbe #${id} introuvable`, { category: 'operation', id })
      throw Object.assign(new Error('Modèle Freezbe introuvable'), { status: 404 })
    }
    return mapFreezebeToResponse(mapRecordToFreezebe(record))
  },

  async search(nom: string): Promise<FreezebeResponseDTO[]> {
    log.debug(`FreezebeRepository.search("${nom}")`, { category: 'operation', query: nom })
    const records = await FreezebeRepository.search(nom)
    return records.map(r => mapFreezebeToResponse(mapRecordToFreezebe(r)))
  },

  async create(dto: CreateFreezebeDTO): Promise<FreezebeResponseDTO> {
    log.debug('FreezebeRepository.create()', { category: 'operation', nom: dto.nom })
    const record = await FreezebeRepository.create({ ...dto })
    log.info('Modèle Freezbe persisté', { category: 'operation', nom: dto.nom })
    return mapFreezebeToResponse(mapRecordToFreezebe(record))
  },

  async update(id: number, dto: UpdateFreezebeDTO): Promise<FreezebeResponseDTO> {
    log.debug(`FreezebeRepository.update(${id})`, { category: 'operation', id })
    const record = await FreezebeRepository.update(id, dto)
    log.info(`Modèle Freezbe #${id} persisté`, { category: 'operation', id })
    return mapFreezebeToResponse(mapRecordToFreezebe(record))
  },

  async delete(id: number): Promise<void> {
    log.debug(`FreezebeRepository.delete(${id})`, { category: 'operation', id })
    await FreezebeRepository.delete(id)
    log.info(`Modèle Freezbe #${id} supprimé de la base`, { category: 'operation', id })
  },
}
