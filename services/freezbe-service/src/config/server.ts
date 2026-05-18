import express from 'express'
import { errorMiddleware } from '../middlewares/error.middleware'
import { encryptResponse, decryptBody } from '../middlewares/cipher.middleware'
import freezbeRoutes from '../routes/freezbe.routes'

export function createServer() {
  const app = express()

  app.use(encryptResponse)
  app.use(decryptBody)

  app.use('/api/freezbe', freezbeRoutes)

  app.use(errorMiddleware)

  return app
}
