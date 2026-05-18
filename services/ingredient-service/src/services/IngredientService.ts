import type { CreateIngredientDTO, UpdateIngredientDTO, IngredientResponseDTO } from '../dto/IngredientDTO'
import { IngredientRepository } from '../repositories/IngredientRepository'
import { mapRecordToIngredient, mapIngredientToResponse } from '../mappers/ingredient.mapper'
import { log } from '../utils/logger'

export const IngredientService = {
  async listAll(): Promise<IngredientResponseDTO[]> {
    log.debug('IngredientRepository.findAll()', { category: 'operation' })
    const records = await IngredientRepository.findAll()
    return records.map(r => mapIngredientToResponse(mapRecordToIngredient(r)))
  },

  async getById(id: number): Promise<IngredientResponseDTO> {
    log.debug(`IngredientRepository.findById(${id})`, { category: 'operation', id })
    const record = await IngredientRepository.findById(id)
    if (!record) {
      log.warn(`Ingrédient #${id} introuvable`, { category: 'operation', id })
      throw Object.assign(new Error('Ingrédient introuvable'), { status: 404 })
    }
    return mapIngredientToResponse(mapRecordToIngredient(record))
  },

  async search(nom: string): Promise<IngredientResponseDTO[]> {
    log.debug(`IngredientRepository.search("${nom}")`, { category: 'operation', query: nom })
    const records = await IngredientRepository.search(nom)
    return records.map(r => mapIngredientToResponse(mapRecordToIngredient(r)))
  },

  async create(dto: CreateIngredientDTO): Promise<IngredientResponseDTO> {
    log.debug('IngredientRepository.create()', { category: 'operation', nom: dto.nom })
    const record = await IngredientRepository.create(dto)
    log.info('Ingrédient persisté', { category: 'operation', nom: dto.nom })
    return mapIngredientToResponse(mapRecordToIngredient(record))
  },

  async update(id: number, dto: UpdateIngredientDTO): Promise<IngredientResponseDTO> {
    log.debug(`IngredientRepository.update(${id})`, { category: 'operation', id })
    const record = await IngredientRepository.update(id, dto)
    log.info(`Ingrédient #${id} persisté`, { category: 'operation', id })
    return mapIngredientToResponse(mapRecordToIngredient(record))
  },

  async delete(id: number): Promise<void> {
    log.debug(`IngredientRepository.delete(${id})`, { category: 'operation', id })
    await IngredientRepository.delete(id)
    log.info(`Ingrédient #${id} supprimé de la base`, { category: 'operation', id })
  },
}
