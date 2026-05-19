import type { Request, Response } from 'express'
import { FreezebeService } from '../services/FreezebeService'
import { log } from '../utils/logger'

export const FreezebeController = {
  async listAll(_req: Request, res: Response): Promise<void> {
    log.debug('Listage de tous les modèles Freezbe', { category: 'operation' })
    const items = await FreezebeService.listAll()
    log.info(`${items.length} modèle(s) Freezbe retourné(s)`, { category: 'operation', count: items.length })
    res.json(items)
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    log.debug(`Récupération du modèle Freezbe #${id}`, { category: 'operation', id })
    const item = await FreezebeService.getById(id)
    log.info(`Modèle Freezbe #${id} trouvé`, { category: 'operation', id, nom: item.nom })
    res.json(item)
  },

  async search(req: Request, res: Response): Promise<void> {
    const nom = String(req.query.nom ?? '')
    log.debug('Recherche de modèles Freezbe', { category: 'operation', query: nom })
    const items = await FreezebeService.search(nom)
    log.info(`Recherche "${nom}" : ${items.length} résultat(s)`, { category: 'operation', query: nom, count: items.length })
    res.json(items)
  },

  async create(req: Request, res: Response): Promise<void> {
    log.notice('Création d\'un modèle Freezbe', { category: 'operation', nom: req.body?.nom })
    const item = await FreezebeService.create(req.body)
    log.info('Modèle Freezbe créé', { category: 'operation', id: item.id, nom: item.nom })
    res.status(201).json(item)
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    log.notice(`Mise à jour du modèle Freezbe #${id}`, { category: 'operation', id })
    const item = await FreezebeService.update(id, req.body)
    log.info(`Modèle Freezbe #${id} mis à jour`, { category: 'operation', id, nom: item.nom })
    res.json(item)
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    log.notice(`Suppression du modèle Freezbe #${id}`, { category: 'operation', id })
    await FreezebeService.delete(id)
    log.info(`Modèle Freezbe #${id} supprimé`, { category: 'operation', id })
    res.status(204).send()
  },
}
