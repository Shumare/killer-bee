import type { ErrorRequestHandler } from 'express'

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err.status ?? 500
  const message = err.message ?? 'Erreur interne'
  res.status(status).json({ message })
}
