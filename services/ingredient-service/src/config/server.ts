import express from 'express'
import { errorMiddleware } from '../middlewares/error.middleware'
import { encryptResponse, decryptBody } from '../middlewares/cipher.middleware'
import ingredientRoutes from '../routes/ingredient.routes'

export function createServer() {
  const app = express()

  app.use(encryptResponse)
  app.use(decryptBody)

  app.use('/api/ingredients', ingredientRoutes)

  app.use(errorMiddleware)

  return app
}
