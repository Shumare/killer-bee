import apiClient from './apiClient';
import type { Process, Step, ApiResponse } from '../types';

export type CreateProcessDto = Omit<Process, 'id'>;
export type UpdateProcessDto = Partial<CreateProcessDto>;
export type CreateStepDto = Omit<Step, 'id'>;

export const processesService = {
  async getAll(): Promise<Process[]> {
    const { data } = await apiClient.get<ApiResponse<Process[]>>('/processes');
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to fetch processes');
    }
    return data.data;
  },

  async getById(id: number): Promise<Process> {
    const { data } = await apiClient.get<ApiResponse<Process>>(`/processes/${id}`);
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to fetch process');
    }
    return data.data;
  },

  async create(dto: CreateProcessDto): Promise<Process> {
    const { data } = await apiClient.post<ApiResponse<Process>>('/processes', dto);
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to create process');
    }
    return data.data;
  },

  async update(id: number, dto: UpdateProcessDto): Promise<Process> {
    const { data } = await apiClient.put<ApiResponse<Process>>(`/processes/${id}`, dto);
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to update process');
    }
    return data.data;
  },

  async delete(id: number): Promise<void> {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/processes/${id}`);
    if (!data.success) {
      throw new Error(data.error?.message ?? 'Failed to delete process');
    }
  },

  async getSteps(processId: number): Promise<Step[]> {
    const { data } = await apiClient.get<ApiResponse<Step[]>>(
      `/processes/${processId}/steps`,
    );
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to fetch steps');
    }
    return data.data;
  },

  async addStep(processId: number, dto: CreateStepDto): Promise<Step> {
    const { data } = await apiClient.post<ApiResponse<Step>>(
      `/processes/${processId}/steps`,
      dto,
    );
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to add step');
    }
    return data.data;
  },

  async deleteStep(processId: number, stepId: number): Promise<void> {
    const { data } = await apiClient.delete<ApiResponse<void>>(
      `/processes/${processId}/steps/${stepId}`,
    );
    if (!data.success) {
      throw new Error(data.error?.message ?? 'Failed to delete step');
    }
  },
};
