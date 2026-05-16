import type { Ingredient } from './Ingredient'

export type Freezbe = {
  id: number
  nom: string
  description: string
  pUHT: number
  gamme: string
  ingredients: Ingredient[]
  grammage: number
}
