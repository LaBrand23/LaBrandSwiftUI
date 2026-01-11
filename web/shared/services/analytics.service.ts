import { apiClient, buildQueryString } from '../lib/api';
import {
  DashboardData,
  DashboardOverview,
  ChartDataPoint,
  TopProduct,
  TopBrand,
  OrdersByStatus,
  ApiResponse,
} from '../types';

export interface AnalyticsDateRange {
  start_date?: string;
  end_date?: string;
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

export interface AnalyticsParams extends AnalyticsDateRange {
  brand_id?: string;
  branch_id?: string;
}

export const analyticsService = {
  async getDashboard(params?: AnalyticsParams): Promise<DashboardData> {
    const queryString = buildQueryString((params || {}) as Record<string, unknown>);
    const response = await apiClient.get<ApiResponse<DashboardData>>(
      `/admin/analytics/dashboard${queryString}`
    );
    return response.data.data;
  },

  async getOverview(params?: AnalyticsParams): Promise<DashboardOverview> {
    const queryString = buildQueryString((params || {}) as Record<string, unknown>);
    const response = await apiClient.get<ApiResponse<DashboardOverview>>(
      `/admin/analytics/overview${queryString}`
    );
    return response.data.data;
  },

  async getRevenueChart(
    params?: AnalyticsParams & { interval?: 'day' | 'week' | 'month' }
  ): Promise<ChartDataPoint[]> {
    const queryString = buildQueryString((params || {}) as Record<string, unknown>);
    const response = await apiClient.get<ApiResponse<ChartDataPoint[]>>(
      `/admin/analytics/revenue${queryString}`
    );
    return response.data.data;
  },

  async getTopProducts(
    params?: AnalyticsParams & { limit?: number }
  ): Promise<TopProduct[]> {
    const queryString = buildQueryString((params || {}) as Record<string, unknown>);
    const response = await apiClient.get<ApiResponse<TopProduct[]>>(
      `/admin/analytics/top-products${queryString}`
    );
    return response.data.data;
  },

  async getTopBrands(
    params?: AnalyticsParams & { limit?: number }
  ): Promise<TopBrand[]> {
    const queryString = buildQueryString((params || {}) as Record<string, unknown>);
    const response = await apiClient.get<ApiResponse<TopBrand[]>>(
      `/admin/analytics/top-brands${queryString}`
    );
    return response.data.data;
  },

  async getOrdersByStatus(params?: AnalyticsParams): Promise<OrdersByStatus> {
    const queryString = buildQueryString((params || {}) as Record<string, unknown>);
    const response = await apiClient.get<ApiResponse<OrdersByStatus>>(
      `/admin/analytics/orders-by-status${queryString}`
    );
    return response.data.data;
  },

  async getSalesReport(
    params?: AnalyticsParams
  ): Promise<{
    total_orders: number;
    total_revenue: number;
    average_order_value: number;
    total_items_sold: number;
    by_brand: Array<{
      brand_id: string;
      brand_name: string;
      orders: number;
      revenue: number;
    }>;
    by_category: Array<{
      category_id: string;
      category_name: string;
      orders: number;
      revenue: number;
    }>;
  }> {
    const queryString = buildQueryString((params || {}) as Record<string, unknown>);
    const response = await apiClient.get<
      ApiResponse<{
        total_orders: number;
        total_revenue: number;
        average_order_value: number;
        total_items_sold: number;
        by_brand: Array<{
          brand_id: string;
          brand_name: string;
          orders: number;
          revenue: number;
        }>;
        by_category: Array<{
          category_id: string;
          category_name: string;
          orders: number;
          revenue: number;
        }>;
      }>
    >(`/admin/analytics/sales-report${queryString}`);
    return response.data.data;
  },

  async getCustomersReport(
    params?: AnalyticsParams
  ): Promise<{
    total_customers: number;
    new_customers: number;
    returning_customers: number;
    top_customers: Array<{
      user_id: string;
      full_name: string;
      email: string;
      total_orders: number;
      total_spent: number;
    }>;
  }> {
    const queryString = buildQueryString((params || {}) as Record<string, unknown>);
    const response = await apiClient.get<
      ApiResponse<{
        total_customers: number;
        new_customers: number;
        returning_customers: number;
        top_customers: Array<{
          user_id: string;
          full_name: string;
          email: string;
          total_orders: number;
          total_spent: number;
        }>;
      }>
    >(`/admin/analytics/customers-report${queryString}`);
    return response.data.data;
  },

  async exportReport(
    type: 'sales' | 'orders' | 'products' | 'customers',
    params?: AnalyticsParams & { format?: 'csv' | 'xlsx' }
  ): Promise<Blob> {
    const queryString = buildQueryString((params || {}) as Record<string, unknown>);
    const response = await apiClient.get(
      `/admin/analytics/export/${type}${queryString}`,
      { responseType: 'blob' }
    );
    return response.data;
  },
};

export default analyticsService;
