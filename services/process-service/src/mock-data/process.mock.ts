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
    nom: 'Procédé Moulage Injection Pro 175',
    description: 'Procédé de fabrication du Freeze Bee Pro 175 par moulage par injection',
    freezbeId: 1,
    etapes: [
      'Préparer et peser les matières premières selon le grammage défini',
      'Préchauffer le moule à 80°C',
      'Injecter le mélange de polymères à 220°C sous pression',
      'Maintenir la pression d\'injection pendant 30 secondes',
      'Refroidir le moule à 25°C pendant 60 secondes',
      'Démouler et acheminer vers le poste de contrôle',
    ],
    validationsDeTests: [
      'Contrôle dimensionnel du disque (diamètre et épaisseur)',
      'Contrôle de la masse à ±1g près',
      'Contrôle de résistance aux chocs selon norme EN 71',
    ],
    descriptionsDeControle: [
      'Vérification du diamètre entre 274mm et 276mm',
      'Absence de bavures, bulles ou défauts de surface',
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
