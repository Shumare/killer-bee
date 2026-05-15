import { Router, Request, Response } from 'express';
import { CompositionService, CreateCompositionSchema } from '../services/composition.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });
const compositionService = new CompositionService();

// GET /api/models/:modelId/compositions
router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const modelId = parseInt(req.params['modelId'] ?? '', 10);
  if (isNaN(modelId)) {
    res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid model id' } });
    return;
  }
  try {
    const compositions = await compositionService.findByModelId(modelId);
    res.status(200).json({ success: true, data: compositions });
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

// POST /api/models/:modelId/compositions
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const modelId = parseInt(req.params['modelId'] ?? '', 10);
  if (isNaN(modelId)) {
    res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid model id' } });
    return;
  }

  const parsed = CreateCompositionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.message },
    });
    return;
  }

  try {
    const composition = await compositionService.create(modelId, parsed.data);
    res.status(201).json({ success: true, data: composition });
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

// DELETE /api/models/:modelId/compositions/:id
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] ?? '', 10);
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid composition id' } });
    return;
  }
  try {
    await compositionService.delete(id);
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

export { router as compositionRouter };
