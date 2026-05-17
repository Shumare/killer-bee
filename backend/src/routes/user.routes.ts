import { Router } from 'express'
import { UserController } from '../controllers/UserController'
import { asyncHandler } from '../utils/asyncHandler'
import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.get('/:id', asyncHandler(UserController.getUser))
router.put('/:id', asyncHandler(UserController.updateProfile))

export default router
