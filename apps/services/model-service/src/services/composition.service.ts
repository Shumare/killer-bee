import { CompositionRepository } from '../repositories/composition.repository';
import { ModelRepository } from '../repositories/model.repository';
import { IngredientRepository } from '../repositories/ingredient.repository';
import { Composition } from '../models/Composition';
import { z } from 'zod';

export const CreateCompositionSchema = z.object({
  ingredientId: z.number().int().positive(),
  grammage: z.number().positive(),
});

export type CreateCompositionDto = z.infer<typeof CreateCompositionSchema>;

export class CompositionService {
  private compositionRepository: CompositionRepository;
  private modelRepository: ModelRepository;
  private ingredientRepository: IngredientRepository;

  constructor() {
    this.compositionRepository = new CompositionRepository();
    this.modelRepository = new ModelRepository();
    this.ingredientRepository = new IngredientRepository();
  }

  async findByModelId(modelId: number): Promise<Composition[]> {
    const model = await this.modelRepository.findById(modelId);
    if (!model) {
      const err = new Error(`Model with id ${modelId} not found`);
      (err as NodeJS.ErrnoException).code = 'NOT_FOUND';
      throw err;
    }
    return this.compositionRepository.findByModelId(modelId);
  }

  async create(modelId: number, dto: CreateCompositionDto): Promise<Composition> {
    const model = await this.modelRepository.findById(modelId);
    if (!model) {
      const err = new Error(`Model with id ${modelId} not found`);
      (err as NodeJS.ErrnoException).code = 'NOT_FOUND';
      throw err;
    }

    const ingredient = await this.ingredientRepository.findById(dto.ingredientId);
    if (!ingredient) {
      const err = new Error(`Ingredient with id ${dto.ingredientId} not found`);
      (err as NodeJS.ErrnoException).code = 'NOT_FOUND';
      throw err;
    }

    return this.compositionRepository.create({ modelId, ...dto });
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.compositionRepository.delete(id);
    if (!deleted) {
      const err = new Error(`Composition with id ${id} not found`);
      (err as NodeJS.ErrnoException).code = 'NOT_FOUND';
      throw err;
    }
  }
}
