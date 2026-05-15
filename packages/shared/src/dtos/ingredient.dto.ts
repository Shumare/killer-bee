import { z } from 'zod';

export const CreateIngredientSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
});

export type CreateIngredientDto = z.infer<typeof CreateIngredientSchema>;

export const UpdateIngredientSchema = CreateIngredientSchema.partial();

export type UpdateIngredientDto = z.infer<typeof UpdateIngredientSchema>;
