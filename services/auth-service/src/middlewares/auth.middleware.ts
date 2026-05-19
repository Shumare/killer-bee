import type { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../utils/generateToken'
import { log } from '../utils/logger'

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  log.debug('Vérification du token d\'accès', { category: 'access', path: req.path, method: req.method })

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    log.warn('Token manquant — header Authorization absent ou mal formé', {
      category: 'access',
      path: req.path,
      method: req.method,
    })
    res.status(401).json({ message: 'Token manquant' })
    return
  }

  const token = authHeader.slice(7)
  const payload = verifyToken(token)
  if (!payload) {
    log.warn('Token invalide ou expiré', {
      category: 'access',
      path: req.path,
      method: req.method,
    })
    res.status(401).json({ message: 'Token invalide' })
    return
  }

  log.debug('Token valide — accès autorisé', { category: 'access', path: req.path })
  next()
}
