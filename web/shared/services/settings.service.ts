import { apiClient } from '../lib/api';
import { AppSettings, ApiResponse, PaymentMethod } from '../types';

export interface GeneralSettings {
  app_name: string;
  support_email: string;
  support_phone: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color?: string;
  secondary_color?: string;
}

export interface ShippingSettings {
  free_shipping_threshold: number;
  default_shipping_cost: number;
  shipping_zones?: Array<{
    name: string;
    cities: string[];
    cost: number;
  }>;
}

export interface PaymentSettings {
  enabled_methods: PaymentMethod[];
  payme_config?: {
    merchant_id: string;
    test_mode: boolean;
  };
  click_config?: {
    merchant_id: string;
    service_id: string;
    test_mode: boolean;
  };
}

export interface NotificationSettings {
  email_notifications: {
    new_order: boolean;
    order_status_change: boolean;
    low_stock_alert: boolean;
    new_review: boolean;
  };
  sms_notifications?: {
    enabled: boolean;
    order_confirmation: boolean;
    shipping_update: boolean;
  };
}

export interface AllSettings {
  general: GeneralSettings;
  shipping: ShippingSettings;
  payments: PaymentSettings;
  notifications: NotificationSettings;
}

export const settingsService = {
  async getAll(): Promise<AllSettings> {
    const response = await apiClient.get<ApiResponse<AllSettings>>(
      '/admin/settings'
    );
    return response.data.data;
  },

  async getGeneral(): Promise<GeneralSettings> {
    const response = await apiClient.get<ApiResponse<GeneralSettings>>(
      '/admin/settings/general'
    );
    return response.data.data;
  },

  async updateGeneral(settings: Partial<GeneralSettings>): Promise<GeneralSettings> {
    const response = await apiClient.patch<ApiResponse<GeneralSettings>>(
      '/admin/settings/general',
      settings
    );
    return response.data.data;
  },

  async getShipping(): Promise<ShippingSettings> {
    const response = await apiClient.get<ApiResponse<ShippingSettings>>(
      '/admin/settings/shipping'
    );
    return response.data.data;
  },

  async updateShipping(settings: Partial<ShippingSettings>): Promise<ShippingSettings> {
    const response = await apiClient.patch<ApiResponse<ShippingSettings>>(
      '/admin/settings/shipping',
      settings
    );
    return response.data.data;
  },

  async getPayments(): Promise<PaymentSettings> {
    const response = await apiClient.get<ApiResponse<PaymentSettings>>(
      '/admin/settings/payments'
    );
    return response.data.data;
  },

  async updatePayments(settings: Partial<PaymentSettings>): Promise<PaymentSettings> {
    const response = await apiClient.patch<ApiResponse<PaymentSettings>>(
      '/admin/settings/payments',
      settings
    );
    return response.data.data;
  },

  async getNotifications(): Promise<NotificationSettings> {
    const response = await apiClient.get<ApiResponse<NotificationSettings>>(
      '/admin/settings/notifications'
    );
    return response.data.data;
  },

  async updateNotifications(
    settings: Partial<NotificationSettings>
  ): Promise<NotificationSettings> {
    const response = await apiClient.patch<ApiResponse<NotificationSettings>>(
      '/admin/settings/notifications',
      settings
    );
    return response.data.data;
  },

  async testEmailNotification(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<
      ApiResponse<{ success: boolean; message: string }>
    >('/admin/settings/test-email', {});
    return response.data.data;
  },
};

export default settingsService;
