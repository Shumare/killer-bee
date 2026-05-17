export type ProcessRecord = {
  id: number
  nom: string
  description: string
  freezbeId: number
  etapes: string[]
  validationsDeTests: string[]
  descriptionsDeControle: string[]
}

const processes: ProcessRecord[] = [
  {
    id: 1,
    nom: 'Procédé Pasteurisation Vanille',
    description: 'Procédé de fabrication de la glace vanille',
    freezbeId: 1,
    etapes: [
      'Mélanger lait et crème à 4°C',
      'Chauffer à 85°C pendant 15s',
      'Refroidir à 4°C',
      'Turbiner à -6°C',
      'Conditionner et surgeler à -18°C',
    ],
    validationsDeTests: [
      'Contrôle température pasteurisation',
      'Contrôle microbiologique J+1',
      'Contrôle texture turbinage',
    ],
    descriptionsDeControle: [
      'Vérification pH entre 6.5 et 7.0',
      'Absence de coliformes totaux',
    ],
  },
]

let nextId = processes.length + 1

export function findAllProcesses(): ProcessRecord[] {
  return [...processes]
}

export function findProcessById(id: number): ProcessRecord | null {
  return processes.find(p => p.id === id) ?? null
}

export function findProcessesByFreezebeId(freezbeId: number): ProcessRecord[] {
  return processes.filter(p => p.freezbeId === freezbeId)
}

export function findProcessesByNom(nom: string): ProcessRecord[] {
  return processes.filter(p => p.nom.toLowerCase().includes(nom.toLowerCase()))
}

export function createProcess(data: Omit<ProcessRecord, 'id'>): ProcessRecord {
  const record: ProcessRecord = { ...data, id: nextId++ }
  processes.push(record)
  return record
}

export function updateProcess(id: number, data: Partial<ProcessRecord>): ProcessRecord | null {
  const index = processes.findIndex(p => p.id === id)
  if (index === -1) return null
  processes[index] = { ...processes[index], ...data }
  return processes[index]
}

export function deleteProcess(id: number): boolean {
  const index = processes.findIndex(p => p.id === id)
  if (index === -1) return false
  processes.splice(index, 1)
  return true
}
