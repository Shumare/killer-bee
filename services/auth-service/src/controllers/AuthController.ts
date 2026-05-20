import type { Request, Response } from 'express'
import { AuthService } from '../services/AuthService'
import { validateLoginRequest } from '../validators/auth.validator'
import { log } from '../utils/logger'

export const AuthController = {
  async login(req: Request, res: Response): Promise<void> {
    log.debug('Entrée dans AuthController.login', { category: 'operation', ip: req.ip })
    const body = validateLoginRequest(req.body)
    const result = await AuthService.login(body)
    log.notice('Connexion réussie', { category: 'audit', username: body.username })
    res.json(result)
  },

  async logout(req: Request, res: Response): Promise<void> {
    log.debug('Entrée dans AuthController.logout', { category: 'operation' })
    await AuthService.logout()
    log.notice('Déconnexion effectuée', { category: 'audit' })
    res.status(204).send()
  },
}
