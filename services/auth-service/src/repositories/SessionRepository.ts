import sql from 'mssql'
import { getPool } from '../config/db'
import type { SessionEntity } from '../entities/SessionEntity'

function mapRow(row: Record<string, unknown>): SessionEntity {
  return {
    id: row.id as number,
    token: row.token as string,
    user_id: row.utilisateur_id as number,
    created_at: row.cree_le as Date,
  }
}

export const SessionRepository = {
  async findByToken(token: string): Promise<SessionEntity | null> {
    const pool = await getPool()
    const result = await pool.request()
      .input('token', sql.NVarChar(512), token)
      .execute('sp_GetSessionByToken')
    return result.recordset[0] ? mapRow(result.recordset[0]) : null
  },

  async create(data: Omit<SessionEntity, 'id'>): Promise<SessionEntity> {
    const pool = await getPool()
    const result = await pool.request()
      .input('token', sql.NVarChar(512), data.token)
      .input('utilisateur_id', sql.Int, data.user_id)
      .execute('sp_CreateSession')
    return mapRow(result.recordset[0])
  },

  async deleteByToken(token: string): Promise<void> {
    const pool = await getPool()
    await pool.request()
      .input('token', sql.NVarChar(512), token)
      .execute('sp_DeleteSessionByToken')
  },
}
