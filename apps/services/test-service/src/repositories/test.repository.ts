import { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Test } from '../models/Test';

export class TestRepository {
  private readonly repo: Repository<Test>;

  constructor() {
    this.repo = AppDataSource.getRepository(Test);
  }

  findAll(): Promise<Test[]> {
    return this.repo.find({ relations: ['process'] });
  }

  findById(id: number): Promise<Test | null> {
    return this.repo.findOne({ where: { id }, relations: ['process'] });
  }

  findByProcessId(processId: number): Promise<Test[]> {
    return this.repo.find({ where: { processId }, relations: ['process'] });
  }

  create(data: Partial<Test>): Promise<Test> {
    const test = this.repo.create(data);
    return this.repo.save(test);
  }

  async update(id: number, data: Partial<Test>): Promise<Test | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
