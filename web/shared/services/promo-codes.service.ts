import { apiClient, buildQueryString } from '../lib/api';
import { PromoCode, ApiResponse, Pagination, PaginationParams } from '../types';

export interface PromoCodesQueryParams extends PaginationParams {
  search?: string;
  is_active?: boolean;
  type?: 'percentage' | 'fixed';
}

export interface CreatePromoCodePayload {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount?: number;
  max_discount?: number;
  usage_limit?: number;
  per_user_limit?: number;
  valid_from: string;
  valid_to: string;
  applicable_brands?: string[];
  applicable_categories?: string[];
  is_active?: boolean;
}

export interface UpdatePromoCodePayload extends Partial<CreatePromoCodePayload> {}

export const promoCodesService = {
  async getAll(params?: PromoCodesQueryParams): Promise<{
    promoCodes: PromoCode[];
    pagination?: Pagination;
  }> {
    const queryString = buildQueryString((params || {}) as Record<string, unknown>);
    const response = await apiClient.get<ApiResponse<PromoCode[]>>(
      `/admin/promo-codes${queryString}`
    );
    return {
      promoCodes: response.data.data,
      pagination: response.data.pagination,
    };
  },

  async getById(id: string): Promise<PromoCode> {
    const response = await apiClient.get<ApiResponse<PromoCode>>(
      `/admin/promo-codes/${id}`
    );
    return response.data.data;
  },

  async create(payload: CreatePromoCodePayload): Promise<PromoCode> {
    const response = await apiClient.post<ApiResponse<PromoCode>>(
      '/admin/promo-codes',
      payload
    );
    return response.data.data;
  },

  async update(id: string, payload: UpdatePromoCodePayload): Promise<PromoCode> {
    const response = await apiClient.patch<ApiResponse<PromoCode>>(
      `/admin/promo-codes/${id}`,
      payload
    );
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/promo-codes/${id}`);
  },

  async toggleActive(id: string, is_active: boolean): Promise<PromoCode> {
    const response = await apiClient.patch<ApiResponse<PromoCode>>(
      `/admin/promo-codes/${id}`,
      { is_active }
    );
    return response.data.data;
  },

  async validateCode(code: string): Promise<PromoCode | null> {
    try {
      const response = await apiClient.post<ApiResponse<PromoCode>>(
        '/promo-codes/validate',
        { code }
      );
      return response.data.data;
    } catch {
      return null;
    }
  },
};

export default promoCodesService;
