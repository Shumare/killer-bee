import { Router, Request, Response } from 'express';
import { IngredientService } from '../services/ingredient.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { CreateIngredientSchema, UpdateIngredientSchema } from '@killerbee/shared';

const router = Router();
const ingredientService = new IngredientService();

// GET /api/ingredients
router.get('/', authMiddleware, async (_req: Request, res: Response): Promise<void> => {
  try {
    const ingredients = await ingredientService.findAll();
    res.status(200).json({ success: true, data: ingredients });
  } catch {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
    });
  }
});

// GET /api/ingredients/:id
router.get('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] ?? '', 10);
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid ingredient id' } });
    return;
  }
  try {
    const ingredient = await ingredientService.findById(id);
    res.status(200).json({ success: true, data: ingredient });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'NOT_FOUND') {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: err.message } });
    } else {
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      });
    }
  }
});

// POST /api/ingredients
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateIngredientSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.message },
    });
    return;
  }
  try {
    const ingredient = await ingredientService.create(parsed.data);
    res.status(201).json({ success: true, data: ingredient });
  } catch {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
    });
  }
});

// PUT /api/ingredients/:id
router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] ?? '', 10);
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid ingredient id' } });
    return;
  }
  const parsed = UpdateIngredientSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.message },
    });
    return;
  }
  try {
    const ingredient = await ingredientService.update(id, parsed.data);
    res.status(200).json({ success: true, data: ingredient });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'NOT_FOUND') {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: err.message } });
    } else {
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      });
    }
  }
});

// DELETE /api/ingredients/:id
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] ?? '', 10);
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid ingredient id' } });
    return;
  }
  try {
    await ingredientService.delete(id);
    res.status(200).json({ success: true, data: null });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'NOT_FOUND') {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: err.message } });
    } else {
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      });
    }
  }
});

export { router as ingredientRouter };
