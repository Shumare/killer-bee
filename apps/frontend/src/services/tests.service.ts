import apiClient from './apiClient';
import type { Test, ApiResponse } from '../types';

export type CreateTestDto = Omit<Test, 'id'>;
export type UpdateTestDto = Partial<CreateTestDto>;

export const testsService = {
  async getAll(): Promise<Test[]> {
    const { data } = await apiClient.get<ApiResponse<Test[]>>('/tests');
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to fetch tests');
    }
    return data.data;
  },

  async getById(id: number): Promise<Test> {
    const { data } = await apiClient.get<ApiResponse<Test>>(`/tests/${id}`);
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to fetch test');
    }
    return data.data;
  },

  async getByProcess(processId: number): Promise<Test[]> {
    const { data } = await apiClient.get<ApiResponse<Test[]>>(
      `/processes/${processId}/tests`,
    );
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to fetch tests for process');
    }
    return data.data;
  },

  async create(dto: CreateTestDto): Promise<Test> {
    const { data } = await apiClient.post<ApiResponse<Test>>('/tests', dto);
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to create test');
    }
    return data.data;
  },

  async update(id: number, dto: UpdateTestDto): Promise<Test> {
    const { data } = await apiClient.put<ApiResponse<Test>>(`/tests/${id}`, dto);
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to update test');
    }
    return data.data;
  },

  async delete(id: number): Promise<void> {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/tests/${id}`);
    if (!data.success) {
      throw new Error(data.error?.message ?? 'Failed to delete test');
    }
  },
};
