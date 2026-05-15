import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import winston from 'winston';
import { AppDataSource } from './database/data-source';
import testRouter from './controllers/test.controller';
import { errorMiddleware } from './middleware/error.middleware';

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [new winston.transports.Console()],
});

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();
  logger.info({ service: 'test-service', message: 'Database connected' });

  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use(helmet());

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
      logger.info({
        timestamp: new Date().toISOString(),
        service: 'test-service',
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
      });
    });
    next();
  });

  app.use('/api/tests', testRouter);

  app.use(errorMiddleware);

  const port = parseInt(process.env['TEST_PORT'] ?? '3005', 10);
  app.listen(port, () => {
    logger.info({ service: 'test-service', message: `Listening on port ${port}` });
  });
}

bootstrap().catch((err: unknown) => {
  logger.error({ service: 'test-service', message: 'Failed to start', error: String(err) });
  process.exit(1);
});
