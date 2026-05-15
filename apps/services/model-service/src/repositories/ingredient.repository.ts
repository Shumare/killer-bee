import { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Ingredient } from '../models/Ingredient';

export class IngredientRepository {
  private repository: Repository<Ingredient>;

  constructor() {
    this.repository = AppDataSource.getRepository(Ingredient);
  }

  async findAll(): Promise<Ingredient[]> {
    return this.repository.find();
  }

  async findById(id: number): Promise<Ingredient | null> {
    return this.repository.findOne({ where: { id } });
  }

  async create(data: Partial<Ingredient>): Promise<Ingredient> {
    const ingredient = this.repository.create(data);
    return this.repository.save(ingredient);
  }

  async update(id: number, data: Partial<Ingredient>): Promise<Ingredient | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
