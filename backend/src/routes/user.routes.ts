import { Router } from 'express'
import { UserController } from '../controllers/UserController'

const router = Router()

router.get('/:id', UserController.getUser)
router.put('/:id', UserController.updateProfile)

export default router
