import { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Step } from '../models/Step';

export class StepRepository {
  private readonly repo: Repository<Step>;

  constructor() {
    this.repo = AppDataSource.getRepository(Step);
  }

  findByProcessId(processId: number): Promise<Step[]> {
    return this.repo.find({ where: { processId }, order: { stepOrder: 'ASC' } });
  }

  findById(id: number): Promise<Step | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<Step>): Promise<Step> {
    const step = this.repo.create(data);
    return this.repo.save(step);
  }

  async update(id: number, data: Partial<Step>): Promise<Step | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
