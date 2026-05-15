import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import winston from 'winston';
import { AppDataSource } from './database/data-source';
import ingredientRouter from './controllers/ingredient.controller';
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
  logger.info({ service: 'ingredient-service', message: 'Database connected' });

  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use(helmet());

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
      logger.info({
        timestamp: new Date().toISOString(),
        service: 'ingredient-service',
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
      });
    });
    next();
  });

  app.use('/api/ingredients', ingredientRouter);

  app.use(errorMiddleware);

  const port = parseInt(process.env['INGREDIENT_PORT'] ?? '3003', 10);
  app.listen(port, () => {
    logger.info({ service: 'ingredient-service', message: `Listening on port ${port}` });
  });
}

bootstrap().catch((err: unknown) => {
  logger.error({ service: 'ingredient-service', message: 'Failed to start', error: String(err) });
  process.exit(1);
});
