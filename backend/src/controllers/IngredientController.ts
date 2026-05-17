import type { Request, Response } from 'express'
import { IngredientService } from '../services/IngredientService'

export const IngredientController = {
  async listAll(_req: Request, res: Response): Promise<void> {
    const items = await IngredientService.listAll()
    res.json(items)
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    const item = await IngredientService.getById(id)
    res.json(item)
  },

  async search(req: Request, res: Response): Promise<void> {
    const nom = String(req.query.nom ?? '')
    const items = await IngredientService.search(nom)
    res.json(items)
  },

  async create(req: Request, res: Response): Promise<void> {
    const item = await IngredientService.create(req.body)
    res.status(201).json(item)
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    const item = await IngredientService.update(id, req.body)
    res.json(item)
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    await IngredientService.delete(id)
    res.status(204).send()
  },
}
