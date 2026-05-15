import { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Process } from '../models/Process';

export class ProcessRepository {
  private readonly repo: Repository<Process>;

  constructor() {
    this.repo = AppDataSource.getRepository(Process);
  }

  findAll(): Promise<Process[]> {
    return this.repo.find({ relations: ['steps', 'model'] });
  }

  findById(id: number): Promise<Process | null> {
    return this.repo.findOne({ where: { id }, relations: ['steps', 'model'] });
  }

  findByModelId(modelId: number): Promise<Process[]> {
    return this.repo.find({ where: { modelId }, relations: ['steps', 'model'] });
  }

  create(data: Partial<Process>): Promise<Process> {
    const process = this.repo.create(data);
    return this.repo.save(process);
  }

  async update(id: number, data: Partial<Process>): Promise<Process | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
