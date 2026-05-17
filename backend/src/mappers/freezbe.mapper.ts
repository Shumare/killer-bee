import type { FreezebeRecord } from '../mock-data/freezbe.mock'
import type { Freezbe } from '../models/Freezbe'
import type { FreezebeResponseDTO } from '../dto/FreezebeDTO'

export function mapRecordToFreezebe(record: FreezebeRecord): Freezbe {
  return {
    id: record.id,
    nom: record.nom,
    description: record.description,
    pUHT: record.pUHT,
    gamme: record.gamme,
    ingredients: record.ingredientIds.map(id => ({ id, nom: '', description: '' })),
    grammage: record.grammage,
  }
}

export function mapFreezebeToResponse(freezbe: Freezbe): FreezebeResponseDTO {
  return {
    id: freezbe.id,
    nom: freezbe.nom,
    description: freezbe.description,
    pUHT: freezbe.pUHT,
    gamme: freezbe.gamme,
    ingredientIds: freezbe.ingredients.map(i => i.id),
    grammage: freezbe.grammage,
  }
}
