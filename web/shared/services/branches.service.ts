import { apiClient } from '../lib/api';

export interface Branch {
  id: string;
  brand_id: string;
  name: string;
  address: string;
  city?: string;
  location?: {
    lat: number;
    lng: number;
  };
  phone?: string;
  working_hours?: Record<string, string>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBranchData {
  name: string;
  address: string;
  city?: string;
  location?: {
    lat: number;
    lng: number;
  };
  phone?: string;
  working_hours?: Record<string, string>;
}

export interface UpdateBranchData extends Partial<CreateBranchData> {
  is_active?: boolean;
}

export const branchesService = {
  // Get all branches for a brand
  async getBranches(brandId: string): Promise<Branch[]> {
    const response = await apiClient.get<unknown, { data: Branch[] }>(
      `/brands/${brandId}/branches`
    );
    return response.data;
  },

  // Create a branch
  async createBranch(brandId: string, data: CreateBranchData): Promise<Branch> {
    const response = await apiClient.post<unknown, { data: Branch }>(
      `/brands/${brandId}/branches`,
      data
    );
    return response.data;
  },

  // Update a branch
  async updateBranch(
    brandId: string,
    branchId: string,
    data: UpdateBranchData
  ): Promise<Branch> {
    const response = await apiClient.put<unknown, { data: Branch }>(
      `/brands/${brandId}/branches/${branchId}`,
      data
    );
    return response.data;
  },

  // Delete a branch
  async deleteBranch(brandId: string, branchId: string): Promise<void> {
    await apiClient.delete(`/brands/${brandId}/branches/${branchId}`);
  },
};
