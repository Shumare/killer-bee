import { Router } from 'express'
import { ProcessController } from '../controllers/ProcessController'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

router.get('/', asyncHandler(ProcessController.listAll))
router.get('/:id', asyncHandler(ProcessController.getById))
router.post('/', asyncHandler(ProcessController.create))
router.put('/:id', asyncHandler(ProcessController.update))
router.delete('/:id', asyncHandler(ProcessController.delete))

export default router
