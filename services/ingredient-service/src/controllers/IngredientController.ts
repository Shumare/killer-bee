import type { Request, Response } from 'express'
import { IngredientService } from '../services/IngredientService'
import { log } from '../utils/logger'

export const IngredientController = {
  async listAll(_req: Request, res: Response): Promise<void> {
    log.debug('Listage de tous les ingrédients', { category: 'operation' })
    const items = await IngredientService.listAll()
    log.info(`${items.length} ingrédient(s) retourné(s)`, { category: 'operation', count: items.length })
    res.json(items)
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    log.debug(`Récupération de l'ingrédient #${id}`, { category: 'operation', id })
    const item = await IngredientService.getById(id)
    log.info(`Ingrédient #${id} trouvé`, { category: 'operation', id, nom: item.nom })
    res.json(item)
  },

  async search(req: Request, res: Response): Promise<void> {
    const nom = String(req.query.nom ?? '')
    log.debug('Recherche d\'ingrédients', { category: 'operation', query: nom })
    const items = await IngredientService.search(nom)
    log.info(`Recherche "${nom}" : ${items.length} résultat(s)`, { category: 'operation', query: nom, count: items.length })
    res.json(items)
  },

  async create(req: Request, res: Response): Promise<void> {
    log.notice('Création d\'un ingrédient', { category: 'operation', nom: req.body?.nom })
    const item = await IngredientService.create(req.body)
    log.info('Ingrédient créé', { category: 'operation', id: item.id, nom: item.nom })
    res.status(201).json(item)
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    log.notice(`Mise à jour de l'ingrédient #${id}`, { category: 'operation', id })
    const item = await IngredientService.update(id, req.body)
    log.info(`Ingrédient #${id} mis à jour`, { category: 'operation', id, nom: item.nom })
    res.json(item)
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    log.notice(`Suppression de l'ingrédient #${id}`, { category: 'operation', id })
    await IngredientService.delete(id)
    log.info(`Ingrédient #${id} supprimé`, { category: 'operation', id })
    res.status(204).send()
  },
}
