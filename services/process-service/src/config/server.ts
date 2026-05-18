import express from 'express'
import { errorMiddleware } from '../middlewares/error.middleware'
import { encryptResponse, decryptBody } from '../middlewares/cipher.middleware'
import processRoutes from '../routes/process.routes'

export function createServer() {
  const app = express()

  app.use(encryptResponse)
  app.use(decryptBody)

  app.use('/api/processes', processRoutes)

  app.use(errorMiddleware)

  return app
}
