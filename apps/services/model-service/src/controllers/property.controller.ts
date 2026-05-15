import { Router, Request, Response } from 'express';
import { PropertyService, CreatePropertySchema } from '../services/property.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { z } from 'zod';

const router = Router({ mergeParams: true });
const propertyService = new PropertyService();

const DecryptQuerySchema = z.object({
  keySub1: z.string().transform(Number),
  keySub2: z.string().min(1),
  keyTransposition: z.string().min(1),
});

// GET /api/models/:modelId/properties
router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const modelId = parseInt(req.params['modelId'] ?? '', 10);
  if (isNaN(modelId)) {
    res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid model id' } });
    return;
  }

  const parsedQuery = DecryptQuerySchema.safeParse(req.query);
  if (parsedQuery.success) {
    try {
      const { keySub1, keySub2, keyTransposition } = parsedQuery.data;
      const properties = await propertyService.decryptAll(modelId, keySub1, keySub2, keyTransposition);
      res.status(200).json({ success: true, data: properties });
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
    return;
  }

  try {
    const properties = await propertyService.findByModelId(modelId);
    res.status(200).json({ success: true, data: properties });
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

// POST /api/models/:modelId/properties
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const modelId = parseInt(req.params['modelId'] ?? '', 10);
  if (isNaN(modelId)) {
    res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid model id' } });
    return;
  }

  const parsed = CreatePropertySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.message },
    });
    return;
  }

  try {
    const property = await propertyService.create(modelId, parsed.data);
    res.status(201).json({ success: true, data: property });
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

// DELETE /api/models/:modelId/properties/:id
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] ?? '', 10);
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid property id' } });
    return;
  }
  try {
    await propertyService.delete(id);
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

export { router as propertyRouter };
