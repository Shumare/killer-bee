import { ModelRepository } from '../repositories/model.repository';
import { Model } from '../models/Model';
import { CreateModelDto, UpdateModelDto } from '@killerbee/shared';

export class ModelService {
  private modelRepository: ModelRepository;

  constructor() {
    this.modelRepository = new ModelRepository();
  }

  async findAll(): Promise<Model[]> {
    return this.modelRepository.findAll(true);
  }

  async findById(id: number): Promise<Model> {
    const model = await this.modelRepository.findById(id, true);
    if (!model) {
      const err = new Error(`Model with id ${id} not found`);
      (err as NodeJS.ErrnoException).code = 'NOT_FOUND';
      throw err;
    }
    return model;
  }

  async create(dto: CreateModelDto): Promise<Model> {
    return this.modelRepository.create(dto);
  }

  async update(id: number, dto: UpdateModelDto): Promise<Model> {
    const model = await this.modelRepository.update(id, dto);
    if (!model) {
      const err = new Error(`Model with id ${id} not found`);
      (err as NodeJS.ErrnoException).code = 'NOT_FOUND';
      throw err;
    }
    return model;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.modelRepository.delete(id);
    if (!deleted) {
      const err = new Error(`Model with id ${id} not found`);
      (err as NodeJS.ErrnoException).code = 'NOT_FOUND';
      throw err;
    }
  }
}
