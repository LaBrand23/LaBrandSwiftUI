import { apiClient } from '../lib/api';
import {
  CRMIntegration,
  IntegrationConfig,
  SyncLog,
  SKUMapping,
  IntegrationsQueryParams,
  SyncLogsQueryParams,
  IntegrationTestResult,
  IntegrationStats,
  ApiResponse,
  Pagination,
  AdapterType,
} from '../types';

export interface CreateIntegrationData {
  branch_id: string;
  adapter_type: AdapterType;
  name: string;
  description?: string;
  config: IntegrationConfig;
  sync_interval_minutes?: number;
}

export interface UpdateIntegrationData {
  name?: string;
  description?: string;
  config?: Partial<IntegrationConfig>;
  sync_interval_minutes?: number;
  is_active?: boolean;
}

export interface CreateSKUMappingData {
  external_sku: string;
  product_variant_id?: string;
  product_id?: string;
  is_ignored?: boolean;
}

export interface IntegrationsListResponse {
  integrations: CRMIntegration[];
  pagination: Pagination;
}

export interface SyncLogsListResponse {
  logs: SyncLog[];
  pagination: Pagination;
}

export interface SKUMappingsListResponse {
  mappings: SKUMapping[];
  pagination: Pagination;
}

// Adapter configurations for different CRM types
export const ADAPTER_CONFIGS: Record<AdapterType, {
  label: string;
  description: string;
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'password' | 'number' | 'select' | 'checkbox';
    required: boolean;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    helpText?: string;
  }>;
}> = {
  billz: {
    label: 'Billz',
    description: 'Connect to Billz POS system via REST API',
    fields: [
      { key: 'base_url', label: 'API URL', type: 'text', required: true, placeholder: 'https://api.billz.uz' },
      { key: 'api_key', label: 'API Key', type: 'password', required: true },
      { key: 'api_secret', label: 'API Secret', type: 'password', required: false },
      { key: 'store_id', label: 'Store ID', type: 'text', required: true },
      { key: 'sync_prices', label: 'Sync Prices', type: 'checkbox', required: false, helpText: 'Update product prices from Billz' },
    ],
  },
  '1c': {
    label: '1C Enterprise',
    description: 'Import stock data from 1C via file export',
    fields: [
      {
        key: 'source_type',
        label: 'Source Type',
        type: 'select',
        required: true,
        options: [
          { value: 'ftp', label: 'FTP Server' },
          { value: 'sftp', label: 'SFTP Server' },
          { value: 'upload', label: 'Manual Upload' },
        ],
      },
      { key: 'ftp_host', label: 'FTP Host', type: 'text', required: false, placeholder: 'ftp.example.com' },
      { key: 'ftp_user', label: 'FTP Username', type: 'text', required: false },
      { key: 'ftp_password', label: 'FTP Password', type: 'password', required: false },
      { key: 'file_pattern', label: 'File Pattern', type: 'text', required: false, placeholder: 'stock_*.xml', helpText: 'Pattern to match exported files' },
    ],
  },
  loyverse: {
    label: 'Loyverse',
    description: 'Connect to Loyverse POS system',
    fields: [
      { key: 'api_key', label: 'Access Token', type: 'password', required: true, helpText: 'Generate from Loyverse Dashboard > Settings > Access Tokens' },
      { key: 'store_id', label: 'Store ID', type: 'text', required: false, helpText: 'Leave empty to sync all stores' },
      { key: 'sync_prices', label: 'Sync Prices', type: 'checkbox', required: false },
    ],
  },
  csv: {
    label: 'CSV/Excel Import',
    description: 'Import stock data from CSV or Excel files',
    fields: [
      {
        key: 'source_type',
        label: 'Source Type',
        type: 'select',
        required: true,
        options: [
          { value: 'upload', label: 'Manual Upload' },
          { value: 'ftp', label: 'FTP Server' },
          { value: 'email', label: 'Email Attachment' },
          { value: 'drive', label: 'Google Drive' },
        ],
      },
      { key: 'ftp_host', label: 'FTP Host', type: 'text', required: false },
      { key: 'ftp_user', label: 'FTP Username', type: 'text', required: false },
      { key: 'ftp_password', label: 'FTP Password', type: 'password', required: false },
      { key: 'file_pattern', label: 'File Pattern', type: 'text', required: false, placeholder: '*.csv' },
      { key: 'sku_column', label: 'SKU Column', type: 'text', required: false, placeholder: 'A or sku', helpText: 'Column containing SKU' },
      { key: 'quantity_column', label: 'Quantity Column', type: 'text', required: false, placeholder: 'B or quantity' },
    ],
  },
  webhook: {
    label: 'Webhook',
    description: 'Receive stock updates via webhook',
    fields: [
      { key: 'webhook_secret', label: 'Webhook Secret', type: 'password', required: true, helpText: 'Secret for verifying webhook signatures' },
      { key: 'auto_create_products', label: 'Auto Create Products', type: 'checkbox', required: false, helpText: 'Automatically create products for unknown SKUs' },
    ],
  },
  custom: {
    label: 'Custom Integration',
    description: 'Configure a custom integration',
    fields: [
      { key: 'base_url', label: 'API URL', type: 'text', required: false },
      { key: 'api_key', label: 'API Key', type: 'password', required: false },
      { key: 'custom_config', label: 'Custom Configuration (JSON)', type: 'text', required: false },
    ],
  },
};

export const integrationsService = {
  // Admin endpoints - list all integrations
  async getAll(params?: IntegrationsQueryParams): Promise<IntegrationsListResponse> {
    const response = await apiClient.get<ApiResponse<IntegrationsListResponse>>(
      '/admin/integrations',
      { params }
    );
    return response.data.data;
  },

  async getById(id: string): Promise<CRMIntegration> {
    const response = await apiClient.get<ApiResponse<CRMIntegration>>(
      `/admin/integrations/${id}`
    );
    return response.data.data;
  },

  async create(data: CreateIntegrationData): Promise<CRMIntegration> {
    const response = await apiClient.post<ApiResponse<CRMIntegration>>(
      '/admin/integrations',
      data
    );
    return response.data.data;
  },

  async update(id: string, data: UpdateIntegrationData): Promise<CRMIntegration> {
    const response = await apiClient.patch<ApiResponse<CRMIntegration>>(
      `/admin/integrations/${id}`,
      data
    );
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/integrations/${id}`);
  },

  async toggleActive(id: string, isActive: boolean): Promise<CRMIntegration> {
    const response = await apiClient.patch<ApiResponse<CRMIntegration>>(
      `/admin/integrations/${id}/status`,
      { is_active: isActive }
    );
    return response.data.data;
  },

  async testConnection(id: string): Promise<IntegrationTestResult> {
    const response = await apiClient.post<ApiResponse<IntegrationTestResult>>(
      `/admin/integrations/${id}/test`
    );
    return response.data.data;
  },

  async triggerSync(id: string): Promise<{ sync_id: string; message: string }> {
    const response = await apiClient.post<ApiResponse<{ sync_id: string; message: string }>>(
      `/admin/integrations/${id}/sync`
    );
    return response.data.data;
  },

  async getStats(id: string): Promise<IntegrationStats> {
    const response = await apiClient.get<ApiResponse<IntegrationStats>>(
      `/admin/integrations/${id}/stats`
    );
    return response.data.data;
  },

  // Sync logs
  async getSyncLogs(params?: SyncLogsQueryParams): Promise<SyncLogsListResponse> {
    const response = await apiClient.get<ApiResponse<SyncLogsListResponse>>(
      '/admin/integrations/logs',
      { params }
    );
    return response.data.data;
  },

  async getSyncLog(logId: string): Promise<SyncLog> {
    const response = await apiClient.get<ApiResponse<SyncLog>>(
      `/admin/integrations/logs/${logId}`
    );
    return response.data.data;
  },

  // SKU Mappings
  async getSKUMappings(integrationId: string, params?: { page?: number; limit?: number; unmapped_only?: boolean }): Promise<SKUMappingsListResponse> {
    const response = await apiClient.get<ApiResponse<SKUMappingsListResponse>>(
      `/admin/integrations/${integrationId}/mappings`,
      { params }
    );
    return response.data.data;
  },

  async createSKUMapping(integrationId: string, data: CreateSKUMappingData): Promise<SKUMapping> {
    const response = await apiClient.post<ApiResponse<SKUMapping>>(
      `/admin/integrations/${integrationId}/mappings`,
      data
    );
    return response.data.data;
  },

  async updateSKUMapping(integrationId: string, mappingId: string, data: Partial<CreateSKUMappingData>): Promise<SKUMapping> {
    const response = await apiClient.patch<ApiResponse<SKUMapping>>(
      `/admin/integrations/${integrationId}/mappings/${mappingId}`,
      data
    );
    return response.data.data;
  },

  async deleteSKUMapping(integrationId: string, mappingId: string): Promise<void> {
    await apiClient.delete(`/admin/integrations/${integrationId}/mappings/${mappingId}`);
  },

  async autoMapSKUs(integrationId: string): Promise<{ mapped: number; unmapped: number }> {
    const response = await apiClient.post<ApiResponse<{ mapped: number; unmapped: number }>>(
      `/admin/integrations/${integrationId}/mappings/auto-map`
    );
    return response.data.data;
  },

  // Brand Portal endpoints - brand manager's integrations
  async getBrandIntegrations(params?: { branch_id?: string }): Promise<IntegrationsListResponse> {
    const response = await apiClient.get<ApiResponse<IntegrationsListResponse>>(
      '/brand/me/integrations',
      { params }
    );
    return response.data.data;
  },

  async getBrandIntegration(id: string): Promise<CRMIntegration> {
    const response = await apiClient.get<ApiResponse<CRMIntegration>>(
      `/brand/me/integrations/${id}`
    );
    return response.data.data;
  },

  async getBrandSyncLogs(integrationId?: string, params?: { page?: number; limit?: number }): Promise<SyncLogsListResponse> {
    const response = await apiClient.get<ApiResponse<SyncLogsListResponse>>(
      '/brand/me/integrations/logs',
      { params: { integration_id: integrationId, ...params } }
    );
    return response.data.data;
  },

  async triggerBrandSync(id: string): Promise<{ sync_id: string; message: string }> {
    const response = await apiClient.post<ApiResponse<{ sync_id: string; message: string }>>(
      `/brand/me/integrations/${id}/sync`
    );
    return response.data.data;
  },

  async requestIntegration(data: {
    branch_id: string;
    adapter_type: AdapterType;
    notes?: string;
  }): Promise<{ request_id: string; message: string }> {
    const response = await apiClient.post<ApiResponse<{ request_id: string; message: string }>>(
      '/brand/me/integrations/request',
      data
    );
    return response.data.data;
  },

  // File upload for CSV/1C integrations
  async uploadFile(integrationId: string, file: File): Promise<{ sync_id: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<{ sync_id: string; message: string }>>(
      `/admin/integrations/${integrationId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },
};

export default integrationsService;
