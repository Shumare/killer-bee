export type IngredientDTO = {
  id: number
  nom: string
  description: string
}

export type CreateIngredientDTO = Omit<IngredientDTO, 'id'>
export type UpdateIngredientDTO = Partial<CreateIngredientDTO>
