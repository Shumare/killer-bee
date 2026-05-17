import type { Request, Response } from 'express'
import { AuthService } from '../services/AuthService'
import { validateLoginRequest } from '../validators/auth.validator'

export const AuthController = {
  async login(req: Request, res: Response): Promise<void> {
    const body = validateLoginRequest(req.body)
    const result = await AuthService.login(body)
    res.json(result)
  },

  async logout(req: Request, res: Response): Promise<void> {
    await AuthService.logout()
    res.status(204).send()
  },
}
