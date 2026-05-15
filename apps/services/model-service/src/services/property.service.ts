import { KillerBeeCrypto } from '@killerbee/crypto';
import { PropertyRepository } from '../repositories/property.repository';
import { ModelRepository } from '../repositories/model.repository';
import { Property } from '../models/Property';
import { z } from 'zod';

export const CreatePropertySchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  keySub1: z.number().int(),
  keySub2: z.string().min(1),
  keyTransposition: z.string().min(1),
});

export type CreatePropertyDto = z.infer<typeof CreatePropertySchema>;

export interface DecryptedProperty {
  id: number;
  modelId: number;
  key: string;
  value: string;
}

const crypto = new KillerBeeCrypto();

export class PropertyService {
  private propertyRepository: PropertyRepository;
  private modelRepository: ModelRepository;

  constructor() {
    this.propertyRepository = new PropertyRepository();
    this.modelRepository = new ModelRepository();
  }

  async findByModelId(modelId: number): Promise<Property[]> {
    const model = await this.modelRepository.findById(modelId);
    if (!model) {
      const err = new Error(`Model with id ${modelId} not found`);
      (err as NodeJS.ErrnoException).code = 'NOT_FOUND';
      throw err;
    }
    return this.propertyRepository.findByModelId(modelId);
  }

  async create(modelId: number, dto: CreatePropertyDto): Promise<Property> {
    const model = await this.modelRepository.findById(modelId);
    if (!model) {
      const err = new Error(`Model with id ${modelId} not found`);
      (err as NodeJS.ErrnoException).code = 'NOT_FOUND';
      throw err;
    }

    const encryptedKey = crypto.encrypt(dto.key, dto.keySub1, dto.keySub2, dto.keyTransposition);
    const encryptedValue = crypto.encrypt(
      dto.value,
      dto.keySub1,
      dto.keySub2,
      dto.keyTransposition,
    );

    return this.propertyRepository.create({ modelId, encryptedKey, encryptedValue });
  }

  async decryptAll(
    modelId: number,
    keySub1: number,
    keySub2: string,
    keyTransposition: string,
  ): Promise<DecryptedProperty[]> {
    const model = await this.modelRepository.findById(modelId);
    if (!model) {
      const err = new Error(`Model with id ${modelId} not found`);
      (err as NodeJS.ErrnoException).code = 'NOT_FOUND';
      throw err;
    }

    const properties = await this.propertyRepository.findByModelId(modelId);

    return properties.map((prop) => ({
      id: prop.id,
      modelId: prop.modelId,
      key: crypto.decrypt(prop.encryptedKey, keySub1, keySub2, keyTransposition),
      value: crypto.decrypt(prop.encryptedValue, keySub1, keySub2, keyTransposition),
    }));
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.propertyRepository.delete(id);
    if (!deleted) {
      const err = new Error(`Property with id ${id} not found`);
      (err as NodeJS.ErrnoException).code = 'NOT_FOUND';
      throw err;
    }
  }
}
