import apiClient from './apiClient';
import type { Model, Composition, Process, Property, ApiResponse } from '../types';

export type CreateModelDto = Omit<Model, 'id'>;
export type UpdateModelDto = Partial<CreateModelDto>;

export const modelsService = {
  async getAll(): Promise<Model[]> {
    const { data } = await apiClient.get<ApiResponse<Model[]>>('/models');
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to fetch models');
    }
    return data.data;
  },

  async getById(id: number): Promise<Model> {
    const { data } = await apiClient.get<ApiResponse<Model>>(`/models/${id}`);
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to fetch model');
    }
    return data.data;
  },

  async create(dto: CreateModelDto): Promise<Model> {
    const { data } = await apiClient.post<ApiResponse<Model>>('/models', dto);
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to create model');
    }
    return data.data;
  },

  async update(id: number, dto: UpdateModelDto): Promise<Model> {
    const { data } = await apiClient.put<ApiResponse<Model>>(`/models/${id}`, dto);
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to update model');
    }
    return data.data;
  },

  async delete(id: number): Promise<void> {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/models/${id}`);
    if (!data.success) {
      throw new Error(data.error?.message ?? 'Failed to delete model');
    }
  },

  // Compositions (ingredients of a model)
  async getCompositions(modelId: number): Promise<Composition[]> {
    const { data } = await apiClient.get<ApiResponse<Composition[]>>(
      `/models/${modelId}/compositions`,
    );
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to fetch compositions');
    }
    return data.data;
  },

  async addComposition(
    modelId: number,
    dto: { ingredientId: number; grammage: number },
  ): Promise<Composition> {
    const { data } = await apiClient.post<ApiResponse<Composition>>(
      `/models/${modelId}/compositions`,
      dto,
    );
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to add composition');
    }
    return data.data;
  },

  async deleteComposition(modelId: number, compositionId: number): Promise<void> {
    const { data } = await apiClient.delete<ApiResponse<void>>(
      `/models/${modelId}/compositions/${compositionId}`,
    );
    if (!data.success) {
      throw new Error(data.error?.message ?? 'Failed to delete composition');
    }
  },

  // Processes of a model
  async getProcesses(modelId: number): Promise<Process[]> {
    const { data } = await apiClient.get<ApiResponse<Process[]>>(
      `/models/${modelId}/processes`,
    );
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to fetch processes');
    }
    return data.data;
  },

  // Properties of a model
  async getProperties(modelId: number): Promise<Property[]> {
    const { data } = await apiClient.get<ApiResponse<Property[]>>(
      `/models/${modelId}/properties`,
    );
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to fetch properties');
    }
    return data.data;
  },

  async addProperty(
    modelId: number,
    dto: { encryptedKey: string; encryptedValue: string },
  ): Promise<Property> {
    const { data } = await apiClient.post<ApiResponse<Property>>(
      `/models/${modelId}/properties`,
      dto,
    );
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to add property');
    }
    return data.data;
  },

  async deleteProperty(modelId: number, propertyId: number): Promise<void> {
    const { data } = await apiClient.delete<ApiResponse<void>>(
      `/models/${modelId}/properties/${propertyId}`,
    );
    if (!data.success) {
      throw new Error(data.error?.message ?? 'Failed to delete property');
    }
  },
};
