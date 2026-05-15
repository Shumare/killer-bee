import { z } from 'zod';
import { ProcessRepository } from '../repositories/process.repository';
import { StepRepository } from '../repositories/step.repository';
import { Process } from '../models/Process';
import { Step } from '../models/Step';
import { NotFoundError } from '../middleware/error.middleware';

const CreateProcessSchema = z.object({
  modelId: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string(),
});

const UpdateProcessSchema = CreateProcessSchema.partial();

const CreateStepSchema = z.object({
  stepOrder: z.number().int().nonnegative(),
  description: z.string().min(1),
});

const UpdateStepSchema = CreateStepSchema.partial();

export class ProcessService {
  private readonly processRepo: ProcessRepository;
  private readonly stepRepo: StepRepository;

  constructor() {
    this.processRepo = new ProcessRepository();
    this.stepRepo = new StepRepository();
  }

  getAll(): Promise<Process[]> {
    return this.processRepo.findAll();
  }

  async getById(id: number): Promise<Process> {
    const process = await this.processRepo.findById(id);
    if (!process) {
      throw new NotFoundError(`Process with id ${id} not found`);
    }
    return process;
  }

  getByModelId(modelId: number): Promise<Process[]> {
    return this.processRepo.findByModelId(modelId);
  }

  create(body: unknown): Promise<Process> {
    const data = CreateProcessSchema.parse(body);
    return this.processRepo.create(data);
  }

  async update(id: number, body: unknown): Promise<Process> {
    const data = UpdateProcessSchema.parse(body);
    const updated = await this.processRepo.update(id, data);
    if (!updated) {
      throw new NotFoundError(`Process with id ${id} not found`);
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.processRepo.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Process with id ${id} not found`);
    }
  }

  getSteps(processId: number): Promise<Step[]> {
    return this.stepRepo.findByProcessId(processId);
  }

  async addStep(processId: number, body: unknown): Promise<Step> {
    // Verify process exists
    const process = await this.processRepo.findById(processId);
    if (!process) {
      throw new NotFoundError(`Process with id ${processId} not found`);
    }
    const data = CreateStepSchema.parse(body);
    return this.stepRepo.create({ ...data, processId });
  }

  async updateStep(processId: number, stepId: number, body: unknown): Promise<Step> {
    const existing = await this.stepRepo.findById(stepId);
    if (!existing || existing.processId !== processId) {
      throw new NotFoundError(`Step with id ${stepId} not found in process ${processId}`);
    }
    const data = UpdateStepSchema.parse(body);
    const updated = await this.stepRepo.update(stepId, data);
    if (!updated) {
      throw new NotFoundError(`Step with id ${stepId} not found`);
    }
    return updated;
  }

  async deleteStep(processId: number, stepId: number): Promise<void> {
    const existing = await this.stepRepo.findById(stepId);
    if (!existing || existing.processId !== processId) {
      throw new NotFoundError(`Step with id ${stepId} not found in process ${processId}`);
    }
    const deleted = await this.stepRepo.delete(stepId);
    if (!deleted) {
      throw new NotFoundError(`Step with id ${stepId} not found`);
    }
  }
}
