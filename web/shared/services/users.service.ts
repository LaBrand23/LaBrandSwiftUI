import { apiClient, buildQueryString } from '../lib/api';
import { User, UsersQueryParams, Pagination, UserRole } from '../types';

export interface UsersResponse {
  success: true;
  data: User[];
  pagination: Pagination;
}

export interface UserResponse {
  success: true;
  data: User & {
    addresses?: Array<{
      id: string;
      label: string;
      full_address: string;
      city: string;
      district: string;
      postal_code: string;
      is_default: boolean;
    }>;
    orders_count?: number;
    total_spent?: number;
  };
}

export interface UpdateUserRoleData {
  role: UserRole;
  brand_id?: string;
  branch_id?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  brand_id?: string;
  branch_id?: string;
}

export const usersService = {
  // Create a new user (admin only)
  async createUser(data: CreateUserData): Promise<User> {
    const response = await apiClient.post<unknown, { data: User }>('/users', data);
    return response.data;
  },

  // Get all users
  async getUsers(params: UsersQueryParams = {}): Promise<UsersResponse> {
    const queryString = buildQueryString(params as Record<string, unknown>);
    const response = await apiClient.get<unknown, UsersResponse>(`/users${queryString}`);
    return response;
  },

  // Get user by ID
  async getUser(id: string): Promise<UserResponse['data']> {
    const response = await apiClient.get<unknown, UserResponse>(`/users/${id}`);
    return response.data;
  },

  // Update user role (root_admin only)
  async updateUserRole(id: string, data: UpdateUserRoleData): Promise<User> {
    const response = await apiClient.patch<unknown, { data: User }>(`/users/${id}/role`, data);
    return response.data;
  },

  // Deactivate user
  async deactivateUser(id: string): Promise<void> {
    await apiClient.patch(`/users/${id}/deactivate`);
  },

  // Activate user
  async activateUser(id: string): Promise<void> {
    await apiClient.patch(`/users/${id}/activate`);
  },

  // Delete user (root_admin only)
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  // Update user profile
  async updateProfile(id: string, data: { full_name?: string; phone?: string }): Promise<User> {
    const response = await apiClient.patch<unknown, { data: User }>(`/users/${id}`, data);
    return response.data;
  },
};
