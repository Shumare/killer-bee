import apiClient from './apiClient';
import type { User, ApiResponse } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      { email, password },
    );
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Login failed');
    }
    return data.data;
  },

  async register(email: string, password: string): Promise<User> {
    const { data } = await apiClient.post<ApiResponse<User>>(
      '/auth/register',
      { email, password },
    );
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Registration failed');
    }
    return data.data;
  },

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User>>('/auth/me');
    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? 'Failed to fetch user');
    }
    return data.data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
