import { get, post, put, del } from './client'
import type { IngredientDTO, CreateIngredientDTO, UpdateIngredientDTO } from '../dto/ingredient.dto'

export function getAllIngredients(): Promise<IngredientDTO[]> {
  return get<IngredientDTO[]>('/api/ingredients')
}

export function getIngredientById(id: number): Promise<IngredientDTO> {
  return get<IngredientDTO>(`/api/ingredients/${id}`)
}

export function createIngredient(body: CreateIngredientDTO): Promise<IngredientDTO> {
  return post<IngredientDTO>('/api/ingredients', body)
}

export function updateIngredient(id: number, body: UpdateIngredientDTO): Promise<IngredientDTO> {
  return put<IngredientDTO>(`/api/ingredients/${id}`, body)
}

export function searchIngredients(nom: string): Promise<IngredientDTO[]> {
  return get<IngredientDTO[]>(`/api/ingredients/search?nom=${encodeURIComponent(nom)}`)
}

export function deleteIngredient(id: number): Promise<void> {
  return del<void>(`/api/ingredients/${id}`)
}
