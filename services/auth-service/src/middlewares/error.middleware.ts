import type { ErrorRequestHandler } from 'express'
import { log } from '../utils/logger'

export const errorMiddleware: ErrorRequestHandler = (err, req, res, _next) => {
  const status = (err as { status?: number }).status ?? 500
  const message = (err as { message?: string }).message ?? 'Erreur interne'
  const base = { category: 'communication', method: req.method, path: req.path, status }

  if (status === 404) {
    // Ressource introuvable — condition normale mais à tracer
    log.notice(`${req.method} ${req.path} — ${message}`, { ...base, category: 'routing' })
  } else if (status >= 503) {
    // Service indisponible — condition critique
    log.crit(`${req.method} ${req.path} — ${message}`, { ...base, stack: (err as Error).stack })
  } else if (status >= 500) {
    // Erreur interne serveur
    log.error(`${req.method} ${req.path} — ${message}`, { ...base, stack: (err as Error).stack })
  } else if (status === 401 || status === 403) {
    // Accès refusé — anomalie de sécurité
    log.warn(`${req.method} ${req.path} — ${message}`, { ...base, category: 'access' })
  } else {
    // 400, 409, 422 … — erreur client
    log.warn(`${req.method} ${req.path} — ${message}`, { ...base, category: 'validation' })
  }

  res.status(status).json({ message })
}
