import { Router } from 'express'
import { AuthController } from '../controllers/AuthController'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

router.post('/login', asyncHandler(AuthController.login))
router.post('/logout', asyncHandler(AuthController.logout))

export default router
