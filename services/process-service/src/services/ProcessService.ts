import type { CreateProcessDTO, UpdateProcessDTO, ProcessResponseDTO } from '../dto/ProcessDTO'
import { ProcessRepository } from '../repositories/ProcessRepository'
import { mapRecordToProcess, mapProcessToResponse } from '../mappers/process.mapper'
import type { FreezebeRecord } from '../mock-data/freezbe.mock'
import { env } from '../config/env'
import { interGet } from '../utils/httpClient'
import { log } from '../utils/logger'

export const ProcessService = {
  async listAll(): Promise<ProcessResponseDTO[]> {
    log.debug('ProcessRepository.findAll()', { category: 'operation' })
    const records = await ProcessRepository.findAll()
    return records.map(r => mapProcessToResponse(mapRecordToProcess(r)))
  },

  async getById(id: number): Promise<ProcessResponseDTO> {
    log.debug(`ProcessRepository.findById(${id})`, { category: 'operation', id })
    const record = await ProcessRepository.findById(id)
    if (!record) {
      log.warn(`Procédé #${id} introuvable`, { category: 'operation', id })
      throw Object.assign(new Error('Procédé introuvable'), { status: 404 })
    }
    return mapProcessToResponse(mapRecordToProcess(record))
  },

  async create(dto: CreateProcessDTO): Promise<ProcessResponseDTO> {
    log.debug('Vérification du modèle Freezbe associé', { category: 'communication', freezbeId: dto.freezbeId })
    try {
      await interGet<FreezebeRecord>(`${env.FREEZBE_SERVICE_URL}/api/freezbe/${dto.freezbeId}`)
    } catch (err) {
      if ((err as { status?: number }).status === 404) {
        log.warn('Modèle Freezbe associé introuvable — création refusée', {
          category: 'communication',
          freezbeId: dto.freezbeId,
        })
        throw Object.assign(new Error('Modèle Freezbe associé introuvable'), { status: 400 })
      }
      throw err
    }

    log.debug('ProcessRepository.create()', { category: 'operation', nom: dto.nom, freezbeId: dto.freezbeId })
    const record = await ProcessRepository.create(dto)
    log.info('Procédé persisté', { category: 'operation', nom: dto.nom, freezbeId: dto.freezbeId })
    return mapProcessToResponse(mapRecordToProcess(record))
  },

  async update(id: number, dto: UpdateProcessDTO): Promise<ProcessResponseDTO> {
    log.debug(`ProcessRepository.update(${id})`, { category: 'operation', id })
    const record = await ProcessRepository.update(id, dto)
    log.info(`Procédé #${id} persisté`, { category: 'operation', id })
    return mapProcessToResponse(mapRecordToProcess(record))
  },

  async search(nom: string): Promise<ProcessResponseDTO[]> {
    log.debug(`ProcessRepository.search("${nom}")`, { category: 'operation', query: nom })
    const records = await ProcessRepository.search(nom)
    return records.map(r => mapProcessToResponse(mapRecordToProcess(r)))
  },

  async delete(id: number): Promise<void> {
    log.debug(`ProcessRepository.delete(${id})`, { category: 'operation', id })
    await ProcessRepository.delete(id)
    log.info(`Procédé #${id} supprimé de la base`, { category: 'operation', id })
  },
}
