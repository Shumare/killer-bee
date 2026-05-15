import { z } from 'zod';

export const CreateTestSchema = z.object({
  processId: z.number().int().positive(),
  description: z.string().min(1),
  criteria: z.string().min(1),
});

export type CreateTestDto = z.infer<typeof CreateTestSchema>;

export const UpdateTestSchema = CreateTestSchema.partial();

export type UpdateTestDto = z.infer<typeof UpdateTestSchema>;
