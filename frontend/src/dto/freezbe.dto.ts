export type FreezebeDTO = {
  id: number
  nom: string
  description: string
  pUHT: number
  gamme: string
  ingredientIds: number[]
  grammage: number
}

export type CreateFreezebeDTO = Omit<FreezebeDTO, 'id'>
export type UpdateFreezebeDTO = Partial<CreateFreezebeDTO>
