import type { ErrorRequestHandler } from 'express'
import { logCommunicationError, logValidationError } from '../utils/logger'

export const errorMiddleware: ErrorRequestHandler = (err, req, res, _next) => {
  const status = (err as { status?: number }).status ?? 500
  const message = (err as { message?: string }).message ?? 'Erreur interne'

  if (status >= 500) {
    logCommunicationError(`${req.method} ${req.path} — ${message}`, {
      status,
      stack: (err as Error).stack,
    })
  } else if (status === 400) {
    logValidationError(`${req.method} ${req.path} — ${message}`)
  } else {
    logCommunicationError(`${req.method} ${req.path} — ${message}`, { status })
  }

  res.status(status).json({ message })
}
