import { apiClient, buildQueryString } from '../lib/api';
import { Order, OrderDetails, OrdersQueryParams, OrderStatus, Pagination } from '../types';

export interface OrdersResponse {
  success: true;
  data: Order[];
  pagination: Pagination;
}

export interface OrderResponse {
  success: true;
  data: OrderDetails;
}

export const ordersService = {
  // Get all orders
  async getOrders(params: OrdersQueryParams = {}): Promise<OrdersResponse> {
    const queryString = buildQueryString(params as Record<string, unknown>);
    const response = await apiClient.get<unknown, OrdersResponse>(`/orders${queryString}`);
    return response;
  },

  // Get order by ID
  async getOrder(id: string): Promise<OrderDetails> {
    const response = await apiClient.get<unknown, OrderResponse>(`/orders/${id}`);
    return response.data;
  },

  // Update order status
  async updateOrderStatus(id: string, status: OrderStatus, note?: string): Promise<void> {
    await apiClient.patch(`/orders/${id}/status`, { status, note });
  },

  // Cancel order
  async cancelOrder(id: string, reason: string, refund: boolean = false): Promise<void> {
    await apiClient.post(`/orders/${id}/cancel`, { reason, refund });
  },
};
