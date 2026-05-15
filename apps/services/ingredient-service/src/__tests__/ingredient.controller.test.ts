import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { errorMiddleware } from '../middleware/error.middleware';

// Mock the data-source so tests don't require a real DB connection
jest.mock('../database/data-source', () => ({
  AppDataSource: {
    initialize: jest.fn().mockResolvedValue(undefined),
    getRepository: jest.fn().mockReturnValue({
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockReturnValue({}),
      save: jest.fn().mockResolvedValue({ id: 1, name: 'Test', description: 'Desc' }),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    }),
  },
}));

jest.mock('../services/ingredient.service', () => {
  return {
    IngredientService: jest.fn().mockImplementation(() => ({
      getAll: jest.fn().mockResolvedValue([
        { id: 1, name: 'Flour', description: 'Wheat flour', compositions: [] },
      ]),
      getById: jest.fn().mockResolvedValue({
        id: 1,
        name: 'Flour',
        description: 'Wheat flour',
        compositions: [],
      }),
      create: jest.fn().mockResolvedValue({ id: 2, name: 'Sugar', description: 'White sugar' }),
      update: jest.fn().mockResolvedValue({ id: 1, name: 'Updated', description: 'Updated desc' }),
      delete: jest.fn().mockResolvedValue(undefined),
    })),
  };
});

function buildApp(): express.Express {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ingredientRouter = require('../controllers/ingredient.controller').default;
  const app = express();
  app.use(express.json());

  // Bypass auth middleware for tests by mocking it
  app.use('/api/ingredients', (req: Request, _res: Response, next: NextFunction) => {
    req.user = { id: 1, email: 'test@test.com', role: 'admin' };
    next();
  }, ingredientRouter);

  app.use(errorMiddleware);
  return app;
}

describe('Ingredient Controller', () => {
  let app: express.Express;

  beforeAll(() => {
    app = buildApp();
  });

  describe('GET /api/ingredients', () => {
    it('returns 401 without auth token', async () => {
      // Create a separate app without auth bypass
      const freshApp = express();
      freshApp.use(express.json());
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ingredientRouter = require('../controllers/ingredient.controller').default;
      freshApp.use('/api/ingredients', ingredientRouter);
      freshApp.use(errorMiddleware);

      const res = await request(freshApp).get('/api/ingredients');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('returns 200 with valid auth and list of ingredients', async () => {
      const res = await request(app)
        .get('/api/ingredients')
        .set('Authorization', 'Bearer mock_bypassed');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('returns an ingredient by id', async () => {
      const res = await request(app)
        .get('/api/ingredients/1')
        .set('Authorization', 'Bearer mock_bypassed');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id', 1);
    });
  });
});
