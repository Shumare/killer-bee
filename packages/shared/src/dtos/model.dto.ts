import { z } from 'zod';

export const CreateModelSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  grammagePUHT: z.number().positive(),
  gamme: z.string().min(1),
});

export type CreateModelDto = z.infer<typeof CreateModelSchema>;

export const UpdateModelSchema = CreateModelSchema.partial();

export type UpdateModelDto = z.infer<typeof UpdateModelSchema>;
