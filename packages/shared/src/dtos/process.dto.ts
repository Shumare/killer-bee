import { z } from 'zod';

export const CreateProcessSchema = z.object({
  modelId: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string(),
});

export type CreateProcessDto = z.infer<typeof CreateProcessSchema>;

export const UpdateProcessSchema = CreateProcessSchema.partial();

export type UpdateProcessDto = z.infer<typeof UpdateProcessSchema>;
