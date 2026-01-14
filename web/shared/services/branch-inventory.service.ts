import { apiClient, buildQueryString } from '../lib/api';
import { Pagination } from '../types';

export interface BranchInventory {
  id: string;
  branch_id: string;
  product_id: string;
  stock_quantity: number;
  low_stock_threshold: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    price: number;
    images: string[];
  };
  branch?: {
    id: string;
    name: string;
  };
}

export interface BranchInventorySummary {
  total_products: number;
  total_stock: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

export interface BranchInventoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  low_stock?: boolean;
}

export interface AddProductToBranchData {
  product_id: string;
  stock_quantity?: number;
  low_stock_threshold?: number;
}

export interface UpdateBranchStockData {
  stock_quantity?: number;
  low_stock_threshold?: number;
  is_available?: boolean;
}

export interface StockAdjustmentData {
  product_id: string;
  variant_id?: string;
  quantity: number;
  operation: 'set' | 'add' | 'subtract';
  reason?: string;
}

export const branchInventoryService = {
  // Get all inventory for a branch
  async getBranchInventory(
    branchId: string,
    params: BranchInventoryQueryParams = {}
  ): Promise<{ items: BranchInventory[]; pagination: Pagination }> {
    const queryString = buildQueryString(params as Record<string, unknown>);
    const response = await apiClient.get<
      unknown,
      { data: BranchInventory[]; pagination: Pagination }
    >(`/branch-inventory/${branchId}${queryString}`);
    return { items: response.data, pagination: response.pagination };
  },

  // Get inventory summary for a branch
  async getBranchInventorySummary(branchId: string): Promise<BranchInventorySummary> {
    const response = await apiClient.get<unknown, { data: BranchInventorySummary }>(
      `/branch-inventory/${branchId}/summary`
    );
    return response.data;
  },

  // Add a product to branch inventory
  async addProductToBranch(
    branchId: string,
    data: AddProductToBranchData
  ): Promise<BranchInventory> {
    const response = await apiClient.post<unknown, { data: BranchInventory }>(
      `/branch-inventory/${branchId}/products`,
      data
    );
    return response.data;
  },

  // Bulk add products to branch inventory
  async bulkAddProductsToBranch(
    branchId: string,
    productIds: string[]
  ): Promise<BranchInventory[]> {
    const response = await apiClient.post<unknown, { data: BranchInventory[] }>(
      `/branch-inventory/${branchId}/products/bulk`,
      { product_ids: productIds }
    );
    return response.data;
  },

  // Update branch inventory for a product
  async updateBranchStock(
    branchId: string,
    productId: string,
    data: UpdateBranchStockData
  ): Promise<BranchInventory> {
    const response = await apiClient.patch<unknown, { data: BranchInventory }>(
      `/branch-inventory/${branchId}/products/${productId}`,
      data
    );
    return response.data;
  },

  // Adjust stock quantity for a product
  async adjustStock(branchId: string, data: StockAdjustmentData): Promise<BranchInventory> {
    const response = await apiClient.post<unknown, { data: BranchInventory }>(
      `/branch-inventory/${branchId}/adjust`,
      data
    );
    return response.data;
  },

  // Remove a product from branch inventory
  async removeProductFromBranch(branchId: string, productId: string): Promise<void> {
    await apiClient.delete(`/branch-inventory/${branchId}/products/${productId}`);
  },

  // Get inventory for a product across all branches
  async getProductBranchInventory(productId: string): Promise<BranchInventory[]> {
    const response = await apiClient.get<unknown, { data: BranchInventory[] }>(
      `/branch-inventory/product/${productId}`
    );
    return response.data;
  },

  // Get low stock items across all branches
  async getLowStockItems(): Promise<BranchInventory[]> {
    const response = await apiClient.get<unknown, { data: BranchInventory[] }>(
      '/branch-inventory/low-stock'
    );
    return response.data;
  },
};
