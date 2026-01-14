import { apiClient, buildQueryString } from '../lib/api';
import {
  Product,
  ProductDetails,
  ProductVariant,
  ProductsQueryParams,
  Pagination,
  ProductStatus,
} from '../types';

export interface ProductsResponse {
  success: true;
  data: Product[];
  pagination: Pagination;
}

export interface ProductResponse {
  success: true;
  data: ProductDetails;
}

export interface CreateProductData {
  name: string;
  category_id: string;
  primary_branch_id: string;
  description?: string;
  price: number;
  sale_price?: number;
  is_new?: boolean;
  is_featured?: boolean;
  stock_quantity?: number;
  status?: 'draft' | 'active' | 'archived';
  sku?: string;
  compare_at_price?: number;
  cost_price?: number;
  low_stock_threshold?: number;
  images?: string[];
  tags?: string[];
  gender?: 'men' | 'women' | 'kids' | 'unisex';
}

export interface CreateVariantData {
  sku: string;
  size?: string;
  color?: string;
  color_hex?: string;
  price_modifier?: number;
  stock_quantity: number;
  is_active?: boolean;
}

export const productsService = {
  // Get all products
  async getProducts(params: ProductsQueryParams = {}): Promise<ProductsResponse> {
    const queryString = buildQueryString(params as Record<string, unknown>);
    const response = await apiClient.get<unknown, ProductsResponse>(`/products${queryString}`);
    return response;
  },

  // Get product by ID
  async getProduct(id: string): Promise<ProductDetails> {
    const response = await apiClient.get<unknown, ProductResponse>(`/products/${id}`);
    return response.data;
  },

  // Create product
  async createProduct(data: CreateProductData): Promise<Product> {
    const response = await apiClient.post<unknown, { data: Product }>('/products', data);
    return response.data;
  },

  // Update product
  async updateProduct(id: string, data: Partial<CreateProductData>): Promise<Product> {
    const response = await apiClient.put<unknown, { data: Product }>(`/products/${id}`, data);
    return response.data;
  },

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },

  // Bulk update product status
  async bulkUpdateStatus(productIds: string[], status: ProductStatus): Promise<void> {
    await apiClient.patch('/products/bulk/status', { product_ids: productIds, status });
  },

  // Bulk delete products (root_admin only)
  async bulkDelete(productIds: string[]): Promise<void> {
    await apiClient.delete('/products/bulk', { data: { product_ids: productIds } });
  },

  // Get product variants
  async getVariants(productId: string): Promise<ProductVariant[]> {
    const response = await apiClient.get<unknown, { data: ProductVariant[] }>(
      `/products/${productId}/variants`
    );
    return response.data;
  },

  // Create variant
  async createVariant(productId: string, data: CreateVariantData): Promise<ProductVariant> {
    const response = await apiClient.post<unknown, { data: ProductVariant }>(
      `/products/${productId}/variants`,
      data
    );
    return response.data;
  },

  // Update variant
  async updateVariant(
    productId: string,
    variantId: string,
    data: Partial<CreateVariantData>
  ): Promise<ProductVariant> {
    const response = await apiClient.put<unknown, { data: ProductVariant }>(
      `/products/${productId}/variants/${variantId}`,
      data
    );
    return response.data;
  },

  // Delete variant
  async deleteVariant(productId: string, variantId: string): Promise<void> {
    await apiClient.delete(`/products/${productId}/variants/${variantId}`);
  },

  // Bulk create variants
  async bulkCreateVariants(
    productId: string,
    variants: CreateVariantData[],
    autoGenerateSku: boolean = true
  ): Promise<ProductVariant[]> {
    const response = await apiClient.post<unknown, { data: ProductVariant[] }>(
      `/products/${productId}/variants/bulk`,
      { variants, auto_generate_sku: autoGenerateSku }
    );
    return response.data;
  },
};
