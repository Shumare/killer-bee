import sql from 'mssql'
import { getPool } from '../config/db'
import type { IngredientRecord } from '../mock-data/ingredient.mock'

function mapRow(row: Record<string, unknown>): IngredientRecord {
  return {
    id: row.id as number,
    nom: row.nom as string,
    description: row.description as string,
  }
}

export const IngredientRepository = {
  async findAll(): Promise<IngredientRecord[]> {
    const pool = await getPool()
    const result = await pool.request().execute('sp_GetAllIngredients')
    return result.recordset.map(mapRow)
  },

  async findById(id: number): Promise<IngredientRecord | null> {
    const pool = await getPool()
    const result = await pool.request()
      .input('id', sql.Int, id)
      .execute('sp_GetIngredientById')
    return result.recordset[0] ? mapRow(result.recordset[0]) : null
  },

  async search(nom: string): Promise<IngredientRecord[]> {
    const pool = await getPool()
    const result = await pool.request()
      .input('nom', sql.NVarChar(150), nom)
      .execute('sp_SearchIngredients')
    return result.recordset.map(mapRow)
  },

  async create(data: Omit<IngredientRecord, 'id'>): Promise<IngredientRecord> {
    const pool = await getPool()
    const result = await pool.request()
      .input('nom', sql.NVarChar(150), data.nom)
      .input('description', sql.NVarChar(500), data.description ?? null)
      .execute('sp_CreateIngredient')
    return mapRow(result.recordset[0])
  },

  async update(id: number, data: Partial<IngredientRecord>): Promise<IngredientRecord> {
    const current = await IngredientRepository.findById(id)
    if (!current) throw new Error('Ingrédient introuvable')
    const pool = await getPool()
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('nom', sql.NVarChar(150), data.nom ?? current.nom)
      .input('description', sql.NVarChar(500), data.description ?? current.description)
      .execute('sp_UpdateIngredient')
    return mapRow(result.recordset[0])
  },

  async delete(id: number): Promise<void> {
    const pool = await getPool()
    await pool.request()
      .input('id', sql.Int, id)
      .execute('sp_DeleteIngredient')
  },
}
