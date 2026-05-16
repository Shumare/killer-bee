import type { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../utils/generateToken'

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token manquant' })
    return
  }

  const token = authHeader.slice(7)
  const payload = verifyToken(token)
  if (!payload) {
    res.status(401).json({ message: 'Token invalide' })
    return
  }

  next()
}
