import { apiClient, buildQueryString } from '../lib/api';
import { Review, ApiResponse, Pagination, ReviewsQueryParams } from '../types';

export interface ReviewResponsePayload {
  text: string;
}

export const reviewsService = {
  async getAll(params?: ReviewsQueryParams): Promise<{
    reviews: Review[];
    pagination?: Pagination;
  }> {
    const queryString = buildQueryString(params);
    const response = await apiClient.get<ApiResponse<Review[]>>(
      `/admin/reviews${queryString}`
    );
    return {
      reviews: response.data.data,
      pagination: response.data.pagination,
    };
  },

  async getById(id: string): Promise<Review> {
    const response = await apiClient.get<ApiResponse<Review>>(
      `/admin/reviews/${id}`
    );
    return response.data.data;
  },

  async approve(id: string): Promise<Review> {
    const response = await apiClient.patch<ApiResponse<Review>>(
      `/admin/reviews/${id}/approve`,
      {}
    );
    return response.data.data;
  },

  async reject(id: string): Promise<void> {
    await apiClient.patch(`/admin/reviews/${id}/reject`, {});
  },

  async respond(id: string, payload: ReviewResponsePayload): Promise<Review> {
    const response = await apiClient.post<ApiResponse<Review>>(
      `/admin/reviews/${id}/respond`,
      payload
    );
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/reviews/${id}`);
  },

  async getStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    average_rating: number;
    by_rating: Record<number, number>;
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        total: number;
        pending: number;
        approved: number;
        average_rating: number;
        by_rating: Record<number, number>;
      }>
    >('/admin/reviews/stats');
    return response.data.data;
  },
};

export default reviewsService;
