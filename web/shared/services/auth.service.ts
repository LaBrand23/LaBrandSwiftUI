import { apiClient } from '../lib/api';
import { AuthUser } from '../types';

export interface LoginResponse {
  success: true;
  data: AuthUser;
}

export const authService = {
  // Get current user profile from API
  async getMe(): Promise<AuthUser> {
    const response = await apiClient.get<unknown, LoginResponse>('/users/me');
    return response.data;
  },

  // Update profile
  async updateProfile(data: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
  }): Promise<AuthUser> {
    const response = await apiClient.put<unknown, LoginResponse>('/users/me', data);
    return response.data;
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/users/me/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },
};
