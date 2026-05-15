import { Router, Request, Response, NextFunction } from 'express';
import { IngredientService } from '../services/ingredient.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { ApiResponse } from '../types/api.types';

const router = Router();
const service = new IngredientService();

router.get('/', authMiddleware, async (_req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const data = await service.getAll();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authMiddleware, async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const data = await service.getById(Number(req.params['id']));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const data = await service.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authMiddleware, async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const data = await service.update(Number(req.params['id']), req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    await service.delete(Number(req.params['id']));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
