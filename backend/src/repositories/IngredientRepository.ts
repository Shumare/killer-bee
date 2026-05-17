import { findAllIngredients, findIngredientById, findIngredientsByName, createIngredient, updateIngredient, deleteIngredient } from '../mock-data/ingredient.mock'
import type { IngredientRecord } from '../mock-data/ingredient.mock'

export const IngredientRepository = {
  async findAll(): Promise<IngredientRecord[]> {
    return findAllIngredients()
  },

  async findById(id: number): Promise<IngredientRecord | null> {
    return findIngredientById(id)
  },

  async search(nom: string): Promise<IngredientRecord[]> {
    return findIngredientsByName(nom)
  },

  async create(data: Omit<IngredientRecord, 'id'>): Promise<IngredientRecord> {
    return createIngredient(data)
  },

  async update(id: number, data: Partial<IngredientRecord>): Promise<IngredientRecord> {
    const record = updateIngredient(id, data)
    if (!record) throw new Error('Ingrédient introuvable')
    return record
  },

  async delete(id: number): Promise<void> {
    const deleted = deleteIngredient(id)
    if (!deleted) throw new Error('Ingrédient introuvable')
  },
}
