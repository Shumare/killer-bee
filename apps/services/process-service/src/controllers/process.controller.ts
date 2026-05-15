import { Router, Request, Response, NextFunction } from 'express';
import { ProcessService } from '../services/process.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { ApiResponse } from '../types/api.types';

const router = Router();
const service = new ProcessService();

// GET /api/processes
router.get('/', authMiddleware, async (_req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const data = await service.getAll();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /api/processes/model/:modelId — must be before /:id
router.get('/model/:modelId', authMiddleware, async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const data = await service.getByModelId(Number(req.params['modelId']));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /api/processes/:id
router.get('/:id', authMiddleware, async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const data = await service.getById(Number(req.params['id']));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// POST /api/processes
router.post('/', authMiddleware, async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const data = await service.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// PUT /api/processes/:id
router.put('/:id', authMiddleware, async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const data = await service.update(Number(req.params['id']), req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/processes/:id
router.delete('/:id', authMiddleware, async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    await service.delete(Number(req.params['id']));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/processes/:id/steps
router.get('/:id/steps', authMiddleware, async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const data = await service.getSteps(Number(req.params['id']));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// POST /api/processes/:id/steps
router.post('/:id/steps', authMiddleware, async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const data = await service.addStep(Number(req.params['id']), req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// PUT /api/processes/:id/steps/:stepId
router.put('/:id/steps/:stepId', authMiddleware, async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const data = await service.updateStep(
      Number(req.params['id']),
      Number(req.params['stepId']),
      req.body,
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/processes/:id/steps/:stepId
router.delete('/:id/steps/:stepId', authMiddleware, async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    await service.deleteStep(Number(req.params['id']), Number(req.params['stepId']));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
