import { Router, Request, Response } from 'express';
import { ModelService } from '../services/model.service';
import { PropertyService, CreatePropertySchema } from '../services/property.service';
import { CompositionService, CreateCompositionSchema } from '../services/composition.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { CreateModelSchema, UpdateModelSchema } from '@killerbee/shared';
import { z } from 'zod';

const router = Router();
const modelService = new ModelService();
const propertyService = new PropertyService();
const compositionService = new CompositionService();

const DecryptQuerySchema = z.object({
  keySub1: z.string().transform(Number),
  keySub2: z.string().min(1),
  keyTransposition: z.string().min(1),
});

// GET /api/models
router.get('/', authMiddleware, async (_req: Request, res: Response): Promise<void> => {
  try {
    const models = await modelService.findAll();
    res.status(200).json({ success: true, data: models });
  } catch {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
    });
  }
});

// GET /api/models/:id
router.get('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] ?? '', 10);
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid model id' } });
    return;
  }
  try {
    const model = await modelService.findById(id);
    res.status(200).json({ success: true, data: model });
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

// POST /api/models
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateModelSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.message },
    });
    return;
  }
  try {
    const model = await modelService.create(parsed.data);
    res.status(201).json({ success: true, data: model });
  } catch {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
    });
  }
});

// PUT /api/models/:id
router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] ?? '', 10);
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid model id' } });
    return;
  }
  const parsed = UpdateModelSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.message },
    });
    return;
  }
  try {
    const model = await modelService.update(id, parsed.data);
    res.status(200).json({ success: true, data: model });
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

// DELETE /api/models/:id
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] ?? '', 10);
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid model id' } });
    return;
  }
  try {
    await modelService.delete(id);
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

// GET /api/models/:id/properties
router.get('/:id/properties', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] ?? '', 10);
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid model id' } });
    return;
  }

  const parsedQuery = DecryptQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    // Return encrypted properties if no crypto keys provided
    try {
      const properties = await propertyService.findByModelId(id);
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
    const { keySub1, keySub2, keyTransposition } = parsedQuery.data;
    const properties = await propertyService.decryptAll(id, keySub1, keySub2, keyTransposition);
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

// POST /api/models/:id/properties
router.post('/:id/properties', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] ?? '', 10);
  if (isNaN(id)) {
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
    const property = await propertyService.create(id, parsed.data);
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

// GET /api/models/:id/compositions
router.get('/:id/compositions', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] ?? '', 10);
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid model id' } });
    return;
  }
  try {
    const compositions = await compositionService.findByModelId(id);
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

// POST /api/models/:id/compositions
router.post('/:id/compositions', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] ?? '', 10);
  if (isNaN(id)) {
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
    const composition = await compositionService.create(id, parsed.data);
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

export { router as modelRouter };
