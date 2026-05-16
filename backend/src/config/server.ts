import express from 'express'
import { errorMiddleware } from '../middlewares/error.middleware'
import authRoutes from '../routes/auth.routes'
import userRoutes from '../routes/user.routes'
import productRoutes from '../routes/product.routes'

export function createServer() {
  const app = express()

  app.use(express.json())

  app.use('/api/auth', authRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/products', productRoutes)

  app.use(errorMiddleware)

  return app
}
