import express from 'express'
import { errorMiddleware } from '../middlewares/error.middleware'
import { encryptResponse, decryptBody } from '../middlewares/cipher.middleware'
import processRoutes from '../routes/process.routes'

export function createServer() {
  const app = express()

  app.get('/health', (_, res) => res.json({ status: 'ok' }))

  app.use(encryptResponse)
  app.use(decryptBody)

  app.use('/api/processes', processRoutes)

  app.use(errorMiddleware)

  return app
}
