import type { Request, Response } from 'express'
import { UserService } from '../services/UserService'

export const UserController = {
  async getUser(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    const user = await UserService.getUser(id)
    res.json(user)
  },

  async updateProfile(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    const updated = await UserService.updateProfile(id, req.body)
    res.json(updated)
  },
}
