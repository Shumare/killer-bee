export type CreateProcessDTO = {
  nom: string
  description: string
  freezbeId: number
  etapes: string[]
  validationsDeTests: string[]
  descriptionsDeControle: string[]
}

export type UpdateProcessDTO = Partial<CreateProcessDTO>

export type ProcessResponseDTO = {
  id: number
  nom: string
  description: string
  freezbeId: number
  etapes: string[]
  validationsDeTests: string[]
  descriptionsDeControle: string[]
}
