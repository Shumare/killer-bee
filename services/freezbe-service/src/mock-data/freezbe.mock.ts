export type FreezebeRecord = {
  id: number
  nom: string
  description: string
  pUHT: number
  gamme: string
  ingredientIds: number[]
  grammage: number
}

const freezbes: FreezebeRecord[] = [
  {
    id: 1,
    nom: 'Freeze Bee Pro 175',
    description: 'Freeze Bee haute performance destiné au sport de haut niveau, certifié compétition',
    pUHT: 24.9,
    gamme: 'Premium',
    ingredientIds: [1, 2, 3],
    grammage: 175,
  },
  {
    id: 2,
    nom: 'Freeze Bee Loisir 150',
    description: 'Freeze Bee grand public pour le marché du loisir et de la grande distribution',
    pUHT: 9.9,
    gamme: 'Standard',
    ingredientIds: [1, 3],
    grammage: 150,
  },
]

let nextId = freezbes.length + 1

export function findAllFreezebes(): FreezebeRecord[] {
  return [...freezbes]
}

export function findFreezebeById(id: number): FreezebeRecord | null {
  return freezbes.find(f => f.id === id) ?? null
}

export function findFreezebesByNom(nom: string): FreezebeRecord[] {
  return freezbes.filter(f => f.nom.toLowerCase().includes(nom.toLowerCase()))
}

export function createFreezebe(data: Omit<FreezebeRecord, 'id'>): FreezebeRecord {
  const record: FreezebeRecord = { ...data, id: nextId++ }
  freezbes.push(record)
  return record
}

export function updateFreezebe(id: number, data: Partial<FreezebeRecord>): FreezebeRecord | null {
  const index = freezbes.findIndex(f => f.id === id)
  if (index === -1) return null
  freezbes[index] = { ...freezbes[index], ...data }
  return freezbes[index]
}

export function deleteFreezebe(id: number): boolean {
  const index = freezbes.findIndex(f => f.id === id)
  if (index === -1) return false
  freezbes.splice(index, 1)
  return true
}
