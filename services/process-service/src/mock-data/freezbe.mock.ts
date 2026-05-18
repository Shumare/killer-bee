// Copie locale des freezbes pour la validation d'existence lors de la création de procédés.
// TODO: remplacer par un appel HTTP vers freezbe-service (FREEZBE_SERVICE_URL) quand la DB sera intégrée.
export type FreezebeRecord = {
  id: number
  nom: string
}

const freezbes: FreezebeRecord[] = [
  { id: 1, nom: 'Glace Vanille Premium' },
  { id: 2, nom: 'Sorbet Fraise' },
]

export function findFreezebeById(id: number): FreezebeRecord | null {
  return freezbes.find(f => f.id === id) ?? null
}
