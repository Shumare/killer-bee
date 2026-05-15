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

const mockTest = {
  id: 1,
  processId: 1,
  description: 'Test description',
  criteria: 'Pass criteria',
  process: { id: 1, name: 'Process A' },
};

jest.mock('../services/test.service', () => {
  return {
    TestService: jest.fn().mockImplementation(() => ({
      getAll: jest.fn().mockResolvedValue([mockTest]),
      getById: jest.fn().mockResolvedValue(mockTest),
      getByProcessId: jest.fn().mockResolvedValue([mockTest]),
      create: jest.fn().mockResolvedValue(mockTest),
      update: jest.fn().mockResolvedValue(mockTest),
      delete: jest.fn().mockResolvedValue(undefined),
    })),
  };
});

function buildApp(): express.Express {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const testRouter = require('../controllers/test.controller').default;
  const app = express();
  app.use(express.json());

  app.use('/api/tests', (req: Request, _res: Response, next: NextFunction) => {
    req.user = { id: 1, email: 'test@test.com', role: 'admin' };
    next();
  }, testRouter);

  app.use(errorMiddleware);
  return app;
}

describe('Test Controller', () => {
  let app: express.Express;

  beforeAll(() => {
    app = buildApp();
  });

  describe('GET /api/tests', () => {
    it('returns 401 without auth token', async () => {
      const freshApp = express();
      freshApp.use(express.json());
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const testRouter = require('../controllers/test.controller').default;
      freshApp.use('/api/tests', testRouter);
      freshApp.use(errorMiddleware);

      const res = await request(freshApp).get('/api/tests');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('returns 200 with list of tests', async () => {
      const res = await request(app)
        .get('/api/tests')
        .set('Authorization', 'Bearer mock_bypassed');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('returns tests filtered by processId', async () => {
      const res = await request(app)
        .get('/api/tests/process/1')
        .set('Authorization', 'Bearer mock_bypassed');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
