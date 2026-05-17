import express from 'express'
import { errorMiddleware } from '../middlewares/error.middleware'
import { encryptResponse, decryptBody } from '../middlewares/cipher.middleware'
import authRoutes from '../routes/auth.routes'
import userRoutes from '../routes/user.routes'
import freezbeRoutes from '../routes/freezbe.routes'
import ingredientRoutes from '../routes/ingredient.routes'
import processRoutes from '../routes/process.routes'

export function createServer() {
  const app = express()

  app.use(encryptResponse)
  app.use(decryptBody)

  app.use('/api/auth', authRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/freezbe', freezbeRoutes)
  app.use('/api/ingredients', ingredientRoutes)
  app.use('/api/processes', processRoutes)

  app.use(errorMiddleware)

  return app
}
