import { apiClient, buildQueryString } from '../lib/api';
import { Category, ApiResponse, Pagination, PaginationParams, Gender } from '../types';

export interface CategoriesQueryParams extends PaginationParams {
  parent_id?: string | null;
  gender?: Gender;
  is_active?: boolean;
  search?: string;
  include_children?: boolean;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  parent_id?: string;
  image_url?: string;
  gender?: Gender;
  position?: number;
  is_active?: boolean;
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> {}

export const categoriesService = {
  async getAll(params?: CategoriesQueryParams): Promise<{
    categories: Category[];
    pagination?: Pagination;
  }> {
    const queryString = buildQueryString((params || {}) as Record<string, unknown>);
    const response = await apiClient.get<ApiResponse<Category[]>>(
      `/admin/categories${queryString}`
    );
    return {
      categories: response.data.data,
      pagination: response.data.pagination,
    };
  },

  async getTree(gender?: Gender): Promise<Category[]> {
    const queryString = gender ? `?gender=${gender}` : '';
    const response = await apiClient.get<unknown, { success: boolean; data: Category[] }>(
      `/categories/tree${queryString}`
    );
    return response.data;
  },

  async getRootCategories(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>(
      '/admin/categories?parent_id=null'
    );
    return response.data.data;
  },

  async getById(id: string): Promise<Category> {
    const response = await apiClient.get<ApiResponse<Category>>(
      `/admin/categories/${id}`
    );
    return response.data.data;
  },

  async create(payload: CreateCategoryPayload): Promise<Category> {
    const response = await apiClient.post<ApiResponse<Category>>(
      '/admin/categories',
      payload
    );
    return response.data.data;
  },

  async update(id: string, payload: UpdateCategoryPayload): Promise<Category> {
    const response = await apiClient.patch<ApiResponse<Category>>(
      `/admin/categories/${id}`,
      payload
    );
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/categories/${id}`);
  },

  async reorder(
    categories: Array<{ id: string; position: number }>
  ): Promise<void> {
    await apiClient.post('/admin/categories/reorder', { categories });
  },

  async toggleActive(id: string, is_active: boolean): Promise<Category> {
    const response = await apiClient.patch<ApiResponse<Category>>(
      `/admin/categories/${id}`,
      { is_active }
    );
    return response.data.data;
  },
};

export default categoriesService;
