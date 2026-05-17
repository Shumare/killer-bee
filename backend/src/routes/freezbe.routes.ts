import { Router } from 'express'
import { FreezebeController } from '../controllers/FreezebeController'
import { asyncHandler } from '../utils/asyncHandler'
import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.get('/', asyncHandler(FreezebeController.listAll))
router.get('/search', asyncHandler(FreezebeController.search))
router.get('/:id', asyncHandler(FreezebeController.getById))
router.post('/', asyncHandler(FreezebeController.create))
router.put('/:id', asyncHandler(FreezebeController.update))
router.delete('/:id', asyncHandler(FreezebeController.delete))

export default router
