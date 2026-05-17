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
    nom: ' Glace Vanille Premium',
    description: ' Glace à la vanille de Madagascar',
    pUHT: 4.5,
    gamme: ' Premium',
    ingredientIds: [1, 2, 3],
    grammage: 500,
  },
  {
    id: 2,
    nom: ' Sorbet Fraise',
    description: ' Sorbet à la fraise de saison',
    pUHT: 3.2,
    gamme: 'Standard',
    ingredientIds: [3],
    grammage: 350,
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
