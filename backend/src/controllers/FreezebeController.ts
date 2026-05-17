import type { Request, Response } from 'express'
import { FreezebeService } from '../services/FreezebeService'

export const FreezebeController = {
  async listAll(_req: Request, res: Response): Promise<void> {
    const items = await FreezebeService.listAll()
    res.json(items)
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    const item = await FreezebeService.getById(id)
    res.json(item)
  },

  async search(req: Request, res: Response): Promise<void> {
    const nom = String(req.query.nom ?? '')
    const items = await FreezebeService.search(nom)
    res.json(items)
  },

  async create(req: Request, res: Response): Promise<void> {
    const item = await FreezebeService.create(req.body)
    res.status(201).json(item)
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    const item = await FreezebeService.update(id, req.body)
    res.json(item)
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    await FreezebeService.delete(id)
    res.status(204).send()
  },
}
