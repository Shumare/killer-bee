import { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Composition } from '../models/Composition';

export class CompositionRepository {
  private repository: Repository<Composition>;

  constructor() {
    this.repository = AppDataSource.getRepository(Composition);
  }

  async findByModelId(modelId: number): Promise<Composition[]> {
    return this.repository.find({
      where: { modelId },
      relations: ['ingredient'],
    });
  }

  async create(data: Partial<Composition>): Promise<Composition> {
    const composition = this.repository.create(data);
    return this.repository.save(composition);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
