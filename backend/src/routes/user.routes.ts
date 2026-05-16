import { Router } from 'express'
import { UserController } from '../controllers/UserController'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

router.get('/:id', asyncHandler(UserController.getUser))
router.put('/:id', asyncHandler(UserController.updateProfile))

export default router
