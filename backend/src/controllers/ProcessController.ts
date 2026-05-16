import type { Request, Response } from 'express'
import { ProcessService } from '../services/ProcessService'

export const ProcessController = {
  async listAll(_req: Request, res: Response): Promise<void> {
    const items = await ProcessService.listAll()
    res.json(items)
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    const item = await ProcessService.getById(id)
    res.json(item)
  },

  async create(req: Request, res: Response): Promise<void> {
    const item = await ProcessService.create(req.body)
    res.status(201).json(item)
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    const item = await ProcessService.update(id, req.body)
    res.json(item)
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    await ProcessService.delete(id)
    res.status(204).send()
  },
}
