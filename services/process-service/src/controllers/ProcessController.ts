import type { Request, Response } from 'express'
import { ProcessService } from '../services/ProcessService'
import { log } from '../utils/logger'

export const ProcessController = {
  async listAll(_req: Request, res: Response): Promise<void> {
    log.debug('Listage de tous les procédés', { category: 'operation' })
    const items = await ProcessService.listAll()
    log.info(`${items.length} procédé(s) retourné(s)`, { category: 'operation', count: items.length })
    res.json(items)
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    log.debug(`Récupération du procédé #${id}`, { category: 'operation', id })
    const item = await ProcessService.getById(id)
    log.info(`Procédé #${id} trouvé`, { category: 'operation', id, nom: item.nom })
    res.json(item)
  },

  async search(req: Request, res: Response): Promise<void> {
    const nom = String(req.query.nom ?? '')
    log.debug('Recherche de procédés', { category: 'operation', query: nom })
    const items = await ProcessService.search(nom)
    log.info(`Recherche "${nom}" : ${items.length} résultat(s)`, { category: 'operation', query: nom, count: items.length })
    res.json(items)
  },

  async create(req: Request, res: Response): Promise<void> {
    log.notice('Création d\'un procédé de fabrication', { category: 'operation', nom: req.body?.nom })
    const item = await ProcessService.create(req.body)
    log.info('Procédé créé', { category: 'operation', id: item.id, nom: item.nom })
    res.status(201).json(item)
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    log.notice(`Mise à jour du procédé #${id}`, { category: 'operation', id })
    const item = await ProcessService.update(id, req.body)
    log.info(`Procédé #${id} mis à jour`, { category: 'operation', id, nom: item.nom })
    res.json(item)
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    log.notice(`Suppression du procédé #${id}`, { category: 'operation', id })
    await ProcessService.delete(id)
    log.info(`Procédé #${id} supprimé`, { category: 'operation', id })
    res.status(204).send()
  },
}
