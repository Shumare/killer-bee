import { Router } from 'express'
import { IngredientController } from '../controllers/IngredientController'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

router.get('/', asyncHandler(IngredientController.listAll))
router.get('/search', asyncHandler(IngredientController.search))
router.get('/:id', asyncHandler(IngredientController.getById))
router.post('/', asyncHandler(IngredientController.create))
router.put('/:id', asyncHandler(IngredientController.update))
router.delete('/:id', asyncHandler(IngredientController.delete))

export default router
