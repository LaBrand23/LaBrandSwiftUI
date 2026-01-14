import { apiClient, buildQueryString } from '../lib/api';
import { Notification, NotificationsQueryParams, ApiResponse, Pagination } from '../types';

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: Pagination;
}

export const notificationsService = {
  /**
   * Get all notifications for the current brand manager
   */
  async getNotifications(params?: NotificationsQueryParams): Promise<NotificationsResponse> {
    const queryString = buildQueryString((params || {}) as Record<string, unknown>);
    const response = await apiClient.get<ApiResponse<Notification[]>>(
      `/notifications${queryString}`
    );
    return {
      notifications: response.data.data ?? [],
      pagination: response.data.pagination ?? {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  },

  /**
   * Get a single notification by ID
   */
  async getNotificationById(id: string): Promise<Notification> {
    const response = await apiClient.get<ApiResponse<Notification>>(
      `/notifications/${id}`
    );
    return response.data.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<ApiResponse<{ count: number }>>(
      '/notifications/unread-count'
    );
    return response.data.data?.count ?? 0;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<Notification> {
    const response = await apiClient.patch<unknown, ApiResponse<Notification>>(
      `/notifications/${id}/read`
    );
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all');
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  /**
   * Send push notification (Admin only)
   */
  async sendPushNotification(data: {
    title: string;
    body: string;
    target: 'all' | 'segment' | 'user';
    user_ids?: string[];
    segment?: string;
    data?: Record<string, string>;
  }): Promise<{ sent_count: number }> {
    const response = await apiClient.post<unknown, ApiResponse<{ sent_count: number }>>(
      '/notifications/push',
      data
    );
    return response.data;
  },
};

export default notificationsService;
