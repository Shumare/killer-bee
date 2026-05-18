import express from 'express'
import { errorMiddleware } from '../middlewares/error.middleware'
import { encryptResponse, decryptBody } from '../middlewares/cipher.middleware'
import userRoutes from '../routes/user.routes'

export function createServer() {
  const app = express()

  app.get('/health', (_, res) => res.json({ status: 'ok' }))

  app.use(encryptResponse)
  app.use(decryptBody)

  app.use('/api/users', userRoutes)

  app.use(errorMiddleware)

  return app
}
