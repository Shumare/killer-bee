import { IngredientRepository } from '../repositories/ingredient.repository';
import { Ingredient } from '../models/Ingredient';
import { CreateIngredientDto, UpdateIngredientDto } from '@killerbee/shared';

export class IngredientService {
  private ingredientRepository: IngredientRepository;

  constructor() {
    this.ingredientRepository = new IngredientRepository();
  }

  async findAll(): Promise<Ingredient[]> {
    return this.ingredientRepository.findAll();
  }

  async findById(id: number): Promise<Ingredient> {
    const ingredient = await this.ingredientRepository.findById(id);
    if (!ingredient) {
      const err = new Error(`Ingredient with id ${id} not found`);
      (err as NodeJS.ErrnoException).code = 'NOT_FOUND';
      throw err;
    }
    return ingredient;
  }

  async create(dto: CreateIngredientDto): Promise<Ingredient> {
    return this.ingredientRepository.create(dto);
  }

  async update(id: number, dto: UpdateIngredientDto): Promise<Ingredient> {
    const ingredient = await this.ingredientRepository.update(id, dto);
    if (!ingredient) {
      const err = new Error(`Ingredient with id ${id} not found`);
      (err as NodeJS.ErrnoException).code = 'NOT_FOUND';
      throw err;
    }
    return ingredient;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.ingredientRepository.delete(id);
    if (!deleted) {
      const err = new Error(`Ingredient with id ${id} not found`);
      (err as NodeJS.ErrnoException).code = 'NOT_FOUND';
      throw err;
    }
  }
}
