import { z } from 'zod';
import { TestRepository } from '../repositories/test.repository';
import { Test } from '../models/Test';
import { NotFoundError } from '../middleware/error.middleware';

const CreateTestSchema = z.object({
  processId: z.number().int().positive(),
  description: z.string().min(1),
  criteria: z.string().min(1),
});

const UpdateTestSchema = CreateTestSchema.partial();

export class TestService {
  private readonly repository: TestRepository;

  constructor() {
    this.repository = new TestRepository();
  }

  getAll(): Promise<Test[]> {
    return this.repository.findAll();
  }

  async getById(id: number): Promise<Test> {
    const test = await this.repository.findById(id);
    if (!test) {
      throw new NotFoundError(`Test with id ${id} not found`);
    }
    return test;
  }

  getByProcessId(processId: number): Promise<Test[]> {
    return this.repository.findByProcessId(processId);
  }

  create(body: unknown): Promise<Test> {
    const data = CreateTestSchema.parse(body);
    return this.repository.create(data);
  }

  async update(id: number, body: unknown): Promise<Test> {
    const data = UpdateTestSchema.parse(body);
    const updated = await this.repository.update(id, data);
    if (!updated) {
      throw new NotFoundError(`Test with id ${id} not found`);
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Test with id ${id} not found`);
    }
  }
}
