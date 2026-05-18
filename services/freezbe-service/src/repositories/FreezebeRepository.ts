import sql from 'mssql'
import { getPool } from '../config/db'
import type { FreezebeRecord } from '../mock-data/freezbe.mock'

function mapRow(row: Record<string, unknown>): FreezebeRecord {
  const raw = row.ingredientIds as string
  const ingredientIds = raw
    ? raw.split(',').map(Number).filter(Boolean)
    : []
  return {
    id: row.id as number,
    nom: row.nom as string,
    description: row.description as string,
    pUHT: row.prix_unitaire_HT as number,
    gamme: row.gamme as string,
    grammage: row.grammage as number,
    ingredientIds,
  }
}

export const FreezebeRepository = {
  async findAll(): Promise<FreezebeRecord[]> {
    const pool = await getPool()
    const result = await pool.request().execute('sp_GetAllFreezebes')
    return result.recordset.map(mapRow)
  },

  async findById(id: number): Promise<FreezebeRecord | null> {
    const pool = await getPool()
    const result = await pool.request()
      .input('id', sql.Int, id)
      .execute('sp_GetFreezebeById')
    return result.recordset[0] ? mapRow(result.recordset[0]) : null
  },

  async search(nom: string): Promise<FreezebeRecord[]> {
    const pool = await getPool()
    const result = await pool.request()
      .input('nom', sql.NVarChar(150), nom)
      .execute('sp_SearchFreezebes')
    return result.recordset.map(mapRow)
  },

  async create(data: Omit<FreezebeRecord, 'id'>): Promise<FreezebeRecord> {
    const pool = await getPool()
    const result = await pool.request()
      .input('nom', sql.NVarChar(150), data.nom)
      .input('description', sql.NVarChar(500), data.description ?? null)
      .input('prix_unitaire_HT', sql.Float, data.pUHT)
      .input('gamme', sql.NVarChar(100), data.gamme ?? null)
      .input('grammage', sql.Int, data.grammage)
      .input('ingredientIds', sql.NVarChar(sql.MAX), JSON.stringify(data.ingredientIds ?? []))
      .execute('sp_CreateFreezebe')
    return mapRow(result.recordset[0])
  },

  async update(id: number, data: Partial<FreezebeRecord>): Promise<FreezebeRecord> {
    const current = await FreezebeRepository.findById(id)
    if (!current) throw new Error('Modèle Freezbe introuvable')
    const pool = await getPool()
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('nom', sql.NVarChar(150), data.nom ?? current.nom)
      .input('description', sql.NVarChar(500), data.description ?? current.description)
      .input('prix_unitaire_HT', sql.Float, data.pUHT ?? current.pUHT)
      .input('gamme', sql.NVarChar(100), data.gamme ?? current.gamme)
      .input('grammage', sql.Int, data.grammage ?? current.grammage)
      .input('ingredientIds', sql.NVarChar(sql.MAX), JSON.stringify(data.ingredientIds ?? current.ingredientIds))
      .execute('sp_UpdateFreezebe')
    return mapRow(result.recordset[0])
  },

  async delete(id: number): Promise<void> {
    const pool = await getPool()
    await pool.request()
      .input('id', sql.Int, id)
      .execute('sp_DeleteFreezebe')
  },
}
