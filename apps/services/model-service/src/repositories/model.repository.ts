import { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Model } from '../models/Model';

export class ModelRepository {
  private repository: Repository<Model>;

  constructor() {
    this.repository = AppDataSource.getRepository(Model);
  }

  async findAll(withRelations = false): Promise<Model[]> {
    if (withRelations) {
      return this.repository.find({
        relations: ['compositions', 'compositions.ingredient', 'properties'],
      });
    }
    return this.repository.find();
  }

  async findById(id: number, withRelations = false): Promise<Model | null> {
    if (withRelations) {
      return this.repository.findOne({
        where: { id },
        relations: ['compositions', 'compositions.ingredient', 'properties'],
      });
    }
    return this.repository.findOne({ where: { id } });
  }

  async create(data: Partial<Model>): Promise<Model> {
    const model = this.repository.create(data);
    return this.repository.save(model);
  }

  async update(id: number, data: Partial<Model>): Promise<Model | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
