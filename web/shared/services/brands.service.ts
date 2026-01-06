import { apiClient, buildQueryString } from '../lib/api';
import { Brand, BrandDetails, Branch, BrandsQueryParams, Pagination } from '../types';

export interface BrandsResponse {
  success: true;
  data: Brand[];
  pagination: Pagination;
}

export interface BrandResponse {
  success: true;
  data: BrandDetails;
}

export interface BranchesResponse {
  success: true;
  data: Branch[];
}

export interface CreateBrandData {
  name: string;
  slug?: string;
  logo_url?: string;
  description?: string;
  website?: string;
  is_featured?: boolean;
}

export interface CreateBranchData {
  name: string;
  city: string;
  district?: string;
  address: string;
  phone?: string;
  working_hours?: Record<string, { open: string; close: string }>;
  latitude?: number;
  longitude?: number;
}

export const brandsService = {
  // Get all brands
  async getBrands(params: BrandsQueryParams = {}): Promise<BrandsResponse> {
    const queryString = buildQueryString(params as Record<string, unknown>);
    const response = await apiClient.get<unknown, BrandsResponse>(`/brands${queryString}`);
    return response;
  },

  // Get brand by ID
  async getBrand(id: string): Promise<BrandDetails> {
    const response = await apiClient.get<unknown, BrandResponse>(`/brands/${id}`);
    return response.data;
  },

  // Create brand
  async createBrand(data: CreateBrandData): Promise<Brand> {
    const response = await apiClient.post<unknown, { data: Brand }>('/brands', data);
    return response.data;
  },

  // Update brand
  async updateBrand(id: string, data: Partial<CreateBrandData>): Promise<Brand> {
    const response = await apiClient.put<unknown, { data: Brand }>(`/brands/${id}`, data);
    return response.data;
  },

  // Toggle brand status
  async toggleBrandStatus(id: string, is_active: boolean): Promise<void> {
    await apiClient.patch(`/brands/${id}/status`, { is_active });
  },

  // Delete brand (root_admin only)
  async deleteBrand(id: string): Promise<void> {
    await apiClient.delete(`/brands/${id}`);
  },

  // Get brand branches
  async getBranches(brandId: string): Promise<Branch[]> {
    const response = await apiClient.get<unknown, BranchesResponse>(`/brands/${brandId}/branches`);
    return response.data;
  },

  // Create branch
  async createBranch(brandId: string, data: CreateBranchData): Promise<Branch> {
    const response = await apiClient.post<unknown, { data: Branch }>(`/brands/${brandId}/branches`, data);
    return response.data;
  },

  // Update branch
  async updateBranch(brandId: string, branchId: string, data: Partial<CreateBranchData>): Promise<Branch> {
    const response = await apiClient.put<unknown, { data: Branch }>(`/brands/${brandId}/branches/${branchId}`, data);
    return response.data;
  },

  // Delete branch (root_admin only)
  async deleteBranch(brandId: string, branchId: string): Promise<void> {
    await apiClient.delete(`/brands/${brandId}/branches/${branchId}`);
  },

  // Assign manager to branch
  async assignManager(brandId: string, branchId: string, userId: string): Promise<void> {
    await apiClient.post(`/brands/${brandId}/branches/${branchId}/managers`, { user_id: userId });
  },
};
