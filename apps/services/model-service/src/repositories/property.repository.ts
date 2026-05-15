import { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Property } from '../models/Property';

export class PropertyRepository {
  private repository: Repository<Property>;

  constructor() {
    this.repository = AppDataSource.getRepository(Property);
  }

  async findByModelId(modelId: number): Promise<Property[]> {
    return this.repository.find({ where: { modelId } });
  }

  async findById(id: number): Promise<Property | null> {
    return this.repository.findOne({ where: { id } });
  }

  async create(data: Partial<Property>): Promise<Property> {
    const property = this.repository.create(data);
    return this.repository.save(property);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
