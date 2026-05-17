export type ProcessDTO = {
  id: number
  nom: string
  description: string
  freezbeId: number
  etapes: string[]
  validationsDeTests: string[]
  descriptionsDeControle: string[]
}

export type CreateProcessDTO = Omit<ProcessDTO, 'id'>
export type UpdateProcessDTO = Partial<CreateProcessDTO>
