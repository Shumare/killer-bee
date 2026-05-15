import apiClient from './apiClient';
import type { Ingredient, ApiResponse } from '../types';

export type CreateIngredientDto = Omit<Ingredient, 'id'>;
export type UpdateIngredientDto = Partial<CreateIngredientDto>;

export const ingredientsService = {
  async getAll(): Promise<Ingredient[]> {
    const { data } = await apiClient.get<ApiResponse<Ingredient[]>>('/ingredients');
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to fetch ingredients');
    }
    return data.data;
  },

  async getById(id: number): Promise<Ingredient> {
    const { data } = await apiClient.get<ApiResponse<Ingredient>>(`/ingredients/${id}`);
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to fetch ingredient');
    }
    return data.data;
  },

  async create(dto: CreateIngredientDto): Promise<Ingredient> {
    const { data } = await apiClient.post<ApiResponse<Ingredient>>('/ingredients', dto);
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to create ingredient');
    }
    return data.data;
  },

  async update(id: number, dto: UpdateIngredientDto): Promise<Ingredient> {
    const { data } = await apiClient.put<ApiResponse<Ingredient>>(
      `/ingredients/${id}`,
      dto,
    );
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to update ingredient');
    }
    return data.data;
  },

  async delete(id: number): Promise<void> {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/ingredients/${id}`);
    if (!data.success) {
      throw new Error(data.error?.message ?? 'Failed to delete ingredient');
    }
  },
};
