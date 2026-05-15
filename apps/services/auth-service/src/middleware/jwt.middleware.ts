import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { JwtPayload } from '../services/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const authService = new AuthService();

export async function jwtMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: { code: 'MISSING_TOKEN', message: 'Authorization header missing or malformed' },
    });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = await authService.validateToken(token);
    req.user = payload;
    next();
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    res.status(401).json({
      success: false,
      error: { code: err.code ?? 'INVALID_TOKEN', message: err.message },
    });
  }
}
