import type { ProcessRecord } from '../mock-data/process.mock'
import type { Process } from '../models/Process'
import type { ProcessResponseDTO } from '../dto/ProcessDTO'

export function mapRecordToProcess(record: ProcessRecord): Process {
  return {
    id: record.id,
    nom: record.nom,
    description: record.description,
    freezbeId: record.freezbeId,
    etapes: record.etapes,
    validationsDeTests: record.validationsDeTests,
    descriptionsDeControle: record.descriptionsDeControle,
  }
}

export function mapProcessToResponse(process: Process): ProcessResponseDTO {
  return {
    id: process.id,
    nom: process.nom,
    description: process.description,
    freezbeId: process.freezbeId,
    etapes: process.etapes,
    validationsDeTests: process.validationsDeTests,
    descriptionsDeControle: process.descriptionsDeControle,
  }
}
