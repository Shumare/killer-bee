import express, { type Request, type Response, type NextFunction } from 'express'
import { errorMiddleware } from '../middlewares/error.middleware'
import { encryptResponse, decryptBody } from '../middlewares/cipher.middleware'
import processRoutes from '../routes/process.routes'
import { log, type LogCategory } from '../utils/logger'

function httpLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now()
  const { method, path: reqPath, ip } = req

  log.debug(`→ ${method} ${reqPath}`, {
    category: 'http' as LogCategory,
    method,
    path: reqPath,
    ip,
    ...(Object.keys(req.query).length > 0 && { query: req.query }),
  })

  res.on('finish', () => {
    const ms = Date.now() - start
    const meta = { category: 'http' as LogCategory, method, path: reqPath, status: res.statusCode, ms }
    const msg = `← ${method} ${reqPath} ${res.statusCode} (${ms}ms)`
    if (res.statusCode >= 500)      log.error(msg, meta)
    else if (res.statusCode >= 400) log.warn(msg, meta)
    else                             log.info(msg, meta)
  })

  next()
}

export function createServer() {
  const app = express()

  app.get('/health', (_, res) => res.json({ status: 'ok' }))

  app.use(httpLogger)
  app.use(encryptResponse)
  app.use(decryptBody)

  app.use('/api/processes', processRoutes)

  app.use(errorMiddleware)

  return app
}
