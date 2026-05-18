import type { IngredientRecord } from '../mock-data/ingredient.mock'
import type { Ingredient } from '../models/Ingredient'
import type { IngredientResponseDTO } from '../dto/IngredientDTO'

export function mapRecordToIngredient(record: IngredientRecord): Ingredient {
  return { id: record.id, nom: record.nom, description: record.description }
}

export function mapIngredientToResponse(ingredient: Ingredient): IngredientResponseDTO {
  return { id: ingredient.id, nom: ingredient.nom, description: ingredient.description }
}
