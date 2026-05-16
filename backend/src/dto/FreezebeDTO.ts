export type CreateFreezebeDTO = {
  nom: string
  description: string
  pUHT: number
  gamme: string
  ingredientIds: number[]
  grammage: number
}

export type UpdateFreezebeDTO = Partial<CreateFreezebeDTO>

export type FreezebeResponseDTO = {
  id: number
  nom: string
  description: string
  pUHT: number
  gamme: string
  ingredientIds: number[]
  grammage: number
}
