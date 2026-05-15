import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { errorMiddleware } from '../middleware/error.middleware';

jest.mock('../database/data-source', () => ({
  AppDataSource: {
    initialize: jest.fn().mockResolvedValue(undefined),
    getRepository: jest.fn().mockReturnValue({
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockReturnValue({}),
      save: jest.fn().mockResolvedValue({ id: 1 }),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    }),
  },
}));

const mockProcess = { id: 1, modelId: 1, name: 'Test Process', description: 'Desc', steps: [] };
const mockStep = { id: 1, processId: 1, stepOrder: 1, description: 'Step 1' };

jest.mock('../services/process.service', () => {
  return {
    ProcessService: jest.fn().mockImplementation(() => ({
      getAll: jest.fn().mockResolvedValue([mockProcess]),
      getById: jest.fn().mockResolvedValue(mockProcess),
      getByModelId: jest.fn().mockResolvedValue([mockProcess]),
      create: jest.fn().mockResolvedValue(mockProcess),
      update: jest.fn().mockResolvedValue(mockProcess),
      delete: jest.fn().mockResolvedValue(undefined),
      getSteps: jest.fn().mockResolvedValue([mockStep]),
      addStep: jest.fn().mockResolvedValue(mockStep),
      updateStep: jest.fn().mockResolvedValue(mockStep),
      deleteStep: jest.fn().mockResolvedValue(undefined),
    })),
  };
});

function buildApp(): express.Express {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const processRouter = require('../controllers/process.controller').default;
  const app = express();
  app.use(express.json());

  app.use('/api/processes', (req: Request, _res: Response, next: NextFunction) => {
    req.user = { id: 1, email: 'test@test.com', role: 'admin' };
    next();
  }, processRouter);

  app.use(errorMiddleware);
  return app;
}

describe('Process Controller', () => {
  let app: express.Express;

  beforeAll(() => {
    app = buildApp();
  });

  describe('GET /api/processes', () => {
    it('returns 401 without auth token', async () => {
      const freshApp = express();
      freshApp.use(express.json());
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const processRouter = require('../controllers/process.controller').default;
      freshApp.use('/api/processes', processRouter);
      freshApp.use(errorMiddleware);

      const res = await request(freshApp).get('/api/processes');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('returns 200 with list of processes', async () => {
      const res = await request(app)
        .get('/api/processes')
        .set('Authorization', 'Bearer mock_bypassed');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('returns steps for a process', async () => {
      const res = await request(app)
        .get('/api/processes/1/steps')
        .set('Authorization', 'Bearer mock_bypassed');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
