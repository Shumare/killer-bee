import type { CreateIngredientDTO, UpdateIngredientDTO, IngredientResponseDTO } from '../dto/IngredientDTO'
import { IngredientRepository } from '../repositories/IngredientRepository'
import { mapRecordToIngredient, mapIngredientToResponse } from '../mappers/ingredient.mapper'

export const IngredientService = {
  async listAll(): Promise<IngredientResponseDTO[]> {
    const records = await IngredientRepository.findAll()
    return records.map(r => mapIngredientToResponse(mapRecordToIngredient(r)))
  },

  async getById(id: number): Promise<IngredientResponseDTO> {
    const record = await IngredientRepository.findById(id)
    if (!record) throw Object.assign(new Error('Ingrédient introuvable'), { status: 404 })
    return mapIngredientToResponse(mapRecordToIngredient(record))
  },

  async search(nom: string): Promise<IngredientResponseDTO[]> {
    const records = await IngredientRepository.search(nom)
    return records.map(r => mapIngredientToResponse(mapRecordToIngredient(r)))
  },

  async create(dto: CreateIngredientDTO): Promise<IngredientResponseDTO> {
    const record = await IngredientRepository.create(dto)
    return mapIngredientToResponse(mapRecordToIngredient(record))
  },

  async update(id: number, dto: UpdateIngredientDTO): Promise<IngredientResponseDTO> {
    const record = await IngredientRepository.update(id, dto)
    return mapIngredientToResponse(mapRecordToIngredient(record))
  },

  async delete(id: number): Promise<void> {
    await IngredientRepository.delete(id)
  },
}
