import sql from 'mssql'
import { getPool } from '../config/db'
import type { UserEntity } from '../entities/UserEntity'

function mapRow(row: Record<string, unknown>): UserEntity {
  return {
    id: row.id as number,
    full_name: row.nom_complet as string,
    email: row.email as string,
    password: row.mot_de_passe as string,
    created_at: row.cree_le as Date,
  }
}

export const UserRepository = {
  async findById(id: number): Promise<UserEntity | null> {
    const pool = await getPool()
    const result = await pool.request()
      .input('id', sql.Int, id)
      .execute('sp_GetUserById')
    return result.recordset[0] ? mapRow(result.recordset[0]) : null
  },

  async findByEmail(email: string): Promise<UserEntity | null> {
    const pool = await getPool()
    const result = await pool.request()
      .input('email', sql.NVarChar(255), email)
      .execute('sp_GetUserByEmail')
    return result.recordset[0] ? mapRow(result.recordset[0]) : null
  },

  async update(id: number, data: Partial<UserEntity>): Promise<UserEntity> {
    const current = await UserRepository.findById(id)
    if (!current) throw new Error('Utilisateur introuvable')
    const pool = await getPool()
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('nom_complet', sql.NVarChar(100), data.full_name ?? current.full_name)
      .input('email', sql.NVarChar(255), data.email ?? current.email)
      .execute('sp_UpdateUser')
    return mapRow(result.recordset[0])
  },

  async create(_data: Omit<UserEntity, 'id'>): Promise<UserEntity> {
    throw new Error('Création d\'utilisateur non implémentée')
  },
}
