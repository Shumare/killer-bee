export type IngredientRecord = {
  id: number
  nom: string
  description: string
}

const ingredients: IngredientRecord[] = [
  { id: 1, nom: 'Polymère ABS', description: 'Acrylonitrile Butadiène Styrène, matière première principale pour le moulage par injection' },
  { id: 2, nom: 'Plastifiant DINP', description: 'Di-isononyl phtalate, agent plastifiant améliorant la flexibilité du disque' },
  { id: 3, nom: 'Colorant UV', description: 'Agent colorant résistant aux UV pour la teinte et la finition du disque' },
]

let nextId = ingredients.length + 1

export function findAllIngredients(): IngredientRecord[] {
  return [...ingredients]
}

export function findIngredientById(id: number): IngredientRecord | null {
  return ingredients.find(i => i.id === id) ?? null
}

export function findIngredientsByName(nom: string): IngredientRecord[] {
  return ingredients.filter(i => i.nom.toLowerCase().includes(nom.toLowerCase()))
}

export function createIngredient(data: Omit<IngredientRecord, 'id'>): IngredientRecord {
  const record: IngredientRecord = { ...data, id: nextId++ }
  ingredients.push(record)
  return record
}

export function updateIngredient(id: number, data: Partial<IngredientRecord>): IngredientRecord | null {
  const index = ingredients.findIndex(i => i.id === id)
  if (index === -1) return null
  ingredients[index] = { ...ingredients[index], ...data }
  return ingredients[index]
}

export function deleteIngredient(id: number): boolean {
  const index = ingredients.findIndex(i => i.id === id)
  if (index === -1) return false
  ingredients.splice(index, 1)
  return true
}
