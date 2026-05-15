import { z } from 'zod';

export const CreateStepSchema = z.object({
  processId: z.number().int().positive(),
  stepOrder: z.number().int().nonnegative(),
  description: z.string().min(1),
});

export type CreateStepDto = z.infer<typeof CreateStepSchema>;

export const UpdateStepSchema = CreateStepSchema.partial();

export type UpdateStepDto = z.infer<typeof UpdateStepSchema>;
