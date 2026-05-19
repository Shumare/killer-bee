import type { Request, Response } from 'express'
import { UserService } from '../services/UserService'
import { log } from '../utils/logger'

export const UserController = {
  async getUser(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    log.debug(`Récupération de l'utilisateur #${id}`, { category: 'operation', id })
    const user = await UserService.getUser(id)
    log.info(`Utilisateur #${id} récupéré`, { category: 'operation', id })
    res.json(user)
  },

  async updateProfile(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    log.notice(`Mise à jour du profil utilisateur #${id}`, { category: 'operation', id })
    const updated = await UserService.updateProfile(id, req.body)
    log.info(`Profil utilisateur #${id} mis à jour`, { category: 'operation', id })
    res.json(updated)
  },
}
