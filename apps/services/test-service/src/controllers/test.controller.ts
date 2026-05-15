import { Router, Request, Response, NextFunction } from 'express';
import { TestService } from '../services/test.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { ApiResponse } from '../types/api.types';

const router = Router();
const service = new TestService();

// GET /api/tests
router.get('/', authMiddleware, async (_req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const data = await service.getAll();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /api/tests/process/:processId — must be before /:id
router.get('/process/:processId', authMiddleware, async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const data = await service.getByProcessId(Number(req.params['processId']));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /api/tests/:id
router.get('/:id', authMiddleware, async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const data = await service.getById(Number(req.params['id']));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// POST /api/tests
router.post('/', authMiddleware, async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const data = await service.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// PUT /api/tests/:id
router.put('/:id', authMiddleware, async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const data = await service.update(Number(req.params['id']), req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tests/:id
router.delete('/:id', authMiddleware, async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    await service.delete(Number(req.params['id']));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
