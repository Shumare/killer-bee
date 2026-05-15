import { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Ingredient } from '../models/Ingredient';

export class IngredientRepository {
  private readonly repo: Repository<Ingredient>;

  constructor() {
    this.repo = AppDataSource.getRepository(Ingredient);
  }

  findAll(): Promise<Ingredient[]> {
    return this.repo.find({ relations: ['compositions'] });
  }

  findById(id: number): Promise<Ingredient | null> {
    return this.repo.findOne({ where: { id }, relations: ['compositions'] });
  }

  create(data: Partial<Ingredient>): Promise<Ingredient> {
    const ingredient = this.repo.create(data);
    return this.repo.save(ingredient);
  }

  async update(id: number, data: Partial<Ingredient>): Promise<Ingredient | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
