export type CreateIngredientDTO = {
  nom: string
  description: string
}

export type UpdateIngredientDTO = Partial<CreateIngredientDTO>

export type IngredientResponseDTO = {
  id: number
  nom: string
  description: string
}
