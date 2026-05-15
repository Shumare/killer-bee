import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { jwtMiddleware } from '../middleware/jwt.middleware';

const router = Router();
const authService = new AuthService();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const RefreshSchema = z.object({
  refreshToken: z.string().min(1),
});

// POST /auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.message },
    });
    return;
  }

  try {
    const user = await authService.register(parsed.data.email, parsed.data.password);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EMAIL_TAKEN') {
      res.status(400).json({
        success: false,
        error: { code: 'EMAIL_TAKEN', message: err.message },
      });
    } else {
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      });
    }
  }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.message },
    });
    return;
  }

  try {
    const tokens = await authService.login(parsed.data.email, parsed.data.password);
    res.status(200).json({ success: true, data: tokens });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'INVALID_CREDENTIALS') {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: err.message },
      });
    } else {
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      });
    }
  }
});

// POST /auth/refresh
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const parsed = RefreshSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.message },
    });
    return;
  }

  try {
    const result = await authService.refreshToken(parsed.data.refreshToken);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    res.status(401).json({
      success: false,
      error: { code: err.code ?? 'INVALID_REFRESH_TOKEN', message: err.message },
    });
  }
});

// GET /auth/me
router.get('/me', jwtMiddleware, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.sub;
  try {
    const user = await authService.getUserById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
      return;
    }
    res.status(200).json({ success: true, data: user });
  } catch {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
    });
  }
});

export { router as authRouter };
