import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import winston from 'winston';
import { AppDataSource } from './database/data-source';
import { authRouter } from './controllers/auth.controller';

const PORT = parseInt(process.env['AUTH_PORT'] ?? '3001', 10);

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  defaultMeta: { service: 'auth-service' },
  transports: [new winston.transports.Console()],
});

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

// Audit log middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    logger.info('request', {
      timestamp: new Date().toISOString(),
      service: 'auth-service',
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      userId: req.user?.sub,
    });
  });
  next();
});

app.use('/auth', authRouter);

// 404 fallback
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  });
});

async function bootstrap(): Promise<void> {
  try {
    await AppDataSource.initialize();
    logger.info('Database connection established');

    app.listen(PORT, () => {
      logger.info(`Auth service listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start auth service', { error });
    process.exit(1);
  }
}

bootstrap();
