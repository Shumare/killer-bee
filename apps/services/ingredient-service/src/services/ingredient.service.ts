import { z } from 'zod';
import { IngredientRepository } from '../repositories/ingredient.repository';
import { Ingredient } from '../models/Ingredient';
import { NotFoundError } from '../middleware/error.middleware';

const CreateIngredientSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
});

const UpdateIngredientSchema = CreateIngredientSchema.partial();

export class IngredientService {
  private readonly repository: IngredientRepository;

  constructor() {
    this.repository = new IngredientRepository();
  }

  getAll(): Promise<Ingredient[]> {
    return this.repository.findAll();
  }

  async getById(id: number): Promise<Ingredient> {
    const ingredient = await this.repository.findById(id);
    if (!ingredient) {
      throw new NotFoundError(`Ingredient with id ${id} not found`);
    }
    return ingredient;
  }

  create(body: unknown): Promise<Ingredient> {
    const data = CreateIngredientSchema.parse(body);
    return this.repository.create(data);
  }

  async update(id: number, body: unknown): Promise<Ingredient> {
    const data = UpdateIngredientSchema.parse(body);
    const updated = await this.repository.update(id, data);
    if (!updated) {
      throw new NotFoundError(`Ingredient with id ${id} not found`);
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Ingredient with id ${id} not found`);
    }
  }
}
