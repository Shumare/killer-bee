import sql from 'mssql'
import { getPool } from '../config/db'
import type { ProcessRecord } from '../mock-data/process.mock'

function mapRow(row: Record<string, unknown>): ProcessRecord {
  return {
    id: row.id as number,
    nom: row.nom as string,
    description: row.description as string,
    freezbeId: row.freeze_bee_id as number,
    etapes: JSON.parse((row.etapes as string) ?? '[]'),
    validationsDeTests: JSON.parse((row.validations_tests as string) ?? '[]'),
    descriptionsDeControle: JSON.parse((row.descriptions_controle as string) ?? '[]'),
  }
}

export const ProcessRepository = {
  async findAll(): Promise<ProcessRecord[]> {
    const pool = await getPool()
    const result = await pool.request().execute('sp_GetAllProcesses')
    return result.recordset.map(mapRow)
  },

  async findById(id: number): Promise<ProcessRecord | null> {
    const pool = await getPool()
    const result = await pool.request()
      .input('id', sql.Int, id)
      .execute('sp_GetProcessById')
    return result.recordset[0] ? mapRow(result.recordset[0]) : null
  },

  async findByFreezebeId(freezbeId: number): Promise<ProcessRecord[]> {
    const pool = await getPool()
    const result = await pool.request()
      .input('id', sql.Int, freezbeId)
      .execute('sp_GetProcessById')
    return result.recordset.map(mapRow)
  },

  async search(nom: string): Promise<ProcessRecord[]> {
    const pool = await getPool()
    const result = await pool.request()
      .input('nom', sql.NVarChar(200), nom)
      .execute('sp_SearchProcesses')
    return result.recordset.map(mapRow)
  },

  async create(data: Omit<ProcessRecord, 'id'>): Promise<ProcessRecord> {
    const pool = await getPool()
    const result = await pool.request()
      .input('nom', sql.NVarChar(200), data.nom)
      .input('description', sql.NVarChar(500), data.description ?? null)
      .input('freeze_bee_id', sql.Int, data.freezbeId)
      .input('etapes', sql.NVarChar(sql.MAX), JSON.stringify(data.etapes ?? []))
      .input('validations_tests', sql.NVarChar(sql.MAX), JSON.stringify(data.validationsDeTests ?? []))
      .input('descriptions_controle', sql.NVarChar(sql.MAX), JSON.stringify(data.descriptionsDeControle ?? []))
      .execute('sp_CreateProcess')
    return mapRow(result.recordset[0])
  },

  async update(id: number, data: Partial<ProcessRecord>): Promise<ProcessRecord> {
    const current = await ProcessRepository.findById(id)
    if (!current) throw new Error('Procédé introuvable')
    const pool = await getPool()
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('nom', sql.NVarChar(200), data.nom ?? current.nom)
      .input('description', sql.NVarChar(500), data.description ?? current.description)
      .input('freeze_bee_id', sql.Int, data.freezbeId ?? current.freezbeId)
      .input('etapes', sql.NVarChar(sql.MAX), JSON.stringify(data.etapes ?? current.etapes))
      .input('validations_tests', sql.NVarChar(sql.MAX), JSON.stringify(data.validationsDeTests ?? current.validationsDeTests))
      .input('descriptions_controle', sql.NVarChar(sql.MAX), JSON.stringify(data.descriptionsDeControle ?? current.descriptionsDeControle))
      .execute('sp_UpdateProcess')
    return mapRow(result.recordset[0])
  },

  async delete(id: number): Promise<void> {
    const pool = await getPool()
    await pool.request()
      .input('id', sql.Int, id)
      .execute('sp_DeleteProcess')
  },
}
