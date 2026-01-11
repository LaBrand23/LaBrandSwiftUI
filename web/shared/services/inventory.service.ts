import { apiClient, buildQueryString } from '../lib/api';
import {
  ApiResponse,
  Pagination,
  Product,
  ProductVariant,
  InventorySummary,
  InventoryAlert,
  StockHistoryItem,
} from '../types';

export interface StockSyncStatus {
  id: string;
  brand_id: string;
  brand_name: string;
  last_sync_at: string;
  next_sync_at: string;
  status: 'idle' | 'syncing' | 'success' | 'error';
  error_message?: string;
  products_synced?: number;
  products_failed?: number;
  sync_duration_ms?: number;
}

export interface StockAdjustment {
  product_id: string;
  variant_id?: string;
  quantity: number;
  operation: 'set' | 'add' | 'subtract';
  reason?: string;
}

export interface BulkStockUpdate {
  updates: Array<{
    product_id: string;
    variant_id?: string;
    quantity: number;
  }>;
}

export interface InventoryQueryParams {
  brand_id?: string;
  branch_id?: string;
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  page?: number;
  limit?: number;
  search?: string;
}

export const inventoryService = {
  // Get inventory summary
  async getSummary(brandId?: string): Promise<InventorySummary> {
    const queryString = brandId ? `?brand_id=${brandId}` : '';
    const response = await apiClient.get<ApiResponse<InventorySummary>>(
      `/admin/inventory/summary${queryString}`
    );
    return response.data.data;
  },

  // Get inventory alerts
  async getAlerts(brandId?: string): Promise<InventoryAlert[]> {
    const queryString = brandId ? `?brand_id=${brandId}` : '';
    const response = await apiClient.get<ApiResponse<InventoryAlert[]>>(
      `/admin/inventory/alerts${queryString}`
    );
    return response.data.data;
  },

  // Get stock history
  async getStockHistory(
    params?: InventoryQueryParams
  ): Promise<{ history: StockHistoryItem[]; pagination?: Pagination }> {
    const queryString = buildQueryString((params || {}) as Record<string, unknown>);
    const response = await apiClient.get<ApiResponse<StockHistoryItem[]>>(
      `/admin/inventory/history${queryString}`
    );
    return {
      history: response.data.data,
      pagination: response.data.pagination,
    };
  },

  // Adjust stock for a single product
  async adjustStock(adjustment: StockAdjustment): Promise<Product> {
    const response = await apiClient.post<ApiResponse<Product>>(
      '/admin/inventory/adjust',
      adjustment
    );
    return response.data.data;
  },

  // Bulk update stock
  async bulkUpdate(updates: BulkStockUpdate): Promise<{
    success: number;
    failed: number;
    errors?: Array<{ product_id: string; error: string }>;
  }> {
    const response = await apiClient.post<
      ApiResponse<{
        success: number;
        failed: number;
        errors?: Array<{ product_id: string; error: string }>;
      }>
    >('/admin/inventory/bulk-update', updates);
    return response.data.data;
  },

  // Get sync status for all brands
  async getSyncStatus(): Promise<StockSyncStatus[]> {
    const response = await apiClient.get<ApiResponse<StockSyncStatus[]>>(
      '/admin/inventory/sync/status'
    );
    return response.data.data;
  },

  // Get sync status for specific brand
  async getBrandSyncStatus(brandId: string): Promise<StockSyncStatus> {
    const response = await apiClient.get<ApiResponse<StockSyncStatus>>(
      `/admin/inventory/sync/status/${brandId}`
    );
    return response.data.data;
  },

  // Trigger manual sync for a brand
  async triggerSync(brandId: string): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `/admin/inventory/sync/trigger/${brandId}`,
      {}
    );
    return response.data.data;
  },

  // Trigger sync for all brands
  async triggerSyncAll(): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/inventory/sync/trigger-all',
      {}
    );
    return response.data.data;
  },

  // Get sync logs
  async getSyncLogs(
    brandId?: string,
    limit: number = 50
  ): Promise<
    Array<{
      id: string;
      brand_id: string;
      brand_name: string;
      started_at: string;
      completed_at?: string;
      status: 'running' | 'completed' | 'failed';
      products_synced: number;
      products_failed: number;
      error_message?: string;
    }>
  > {
    const queryString = brandId
      ? `?brand_id=${brandId}&limit=${limit}`
      : `?limit=${limit}`;
    const response = await apiClient.get<
      ApiResponse<
        Array<{
          id: string;
          brand_id: string;
          brand_name: string;
          started_at: string;
          completed_at?: string;
          status: 'running' | 'completed' | 'failed';
          products_synced: number;
          products_failed: number;
          error_message?: string;
        }>
      >
    >(`/admin/inventory/sync/logs${queryString}`);
    return response.data.data;
  },

  // Configure sync settings for a brand
  async configureSyncSettings(
    brandId: string,
    settings: {
      auto_sync_enabled: boolean;
      sync_interval_minutes: number;
      low_stock_notification: boolean;
      out_of_stock_notification: boolean;
    }
  ): Promise<{ message: string }> {
    const response = await apiClient.patch<ApiResponse<{ message: string }>>(
      `/admin/inventory/sync/settings/${brandId}`,
      settings
    );
    return response.data.data;
  },

  // Export inventory report
  async exportInventory(
    brandId?: string,
    format: 'csv' | 'xlsx' = 'csv'
  ): Promise<Blob> {
    const queryString = brandId
      ? `?brand_id=${brandId}&format=${format}`
      : `?format=${format}`;
    const response = await apiClient.get(
      `/admin/inventory/export${queryString}`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Import inventory from file
  async importInventory(
    file: File,
    brandId: string
  ): Promise<{
    success: number;
    failed: number;
    errors?: Array<{ row: number; error: string }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('brand_id', brandId);

    const response = await apiClient.post<
      ApiResponse<{
        success: number;
        failed: number;
        errors?: Array<{ row: number; error: string }>;
      }>
    >('/admin/inventory/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
};

export default inventoryService;
