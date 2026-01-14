import supabase from "../../config/supabase";
import { NotFoundError, BadRequestError } from "../../utils/errors";
import { parsePagination } from "../../utils/helpers";

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

export interface BranchVariantStock {
  id: string;
  branch_id: string;
  variant_id: string;
  stock_quantity: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddProductToBranchInput {
  product_id: string;
  stock_quantity?: number;
  low_stock_threshold?: number;
}

export interface UpdateBranchStockInput {
  stock_quantity?: number;
  low_stock_threshold?: number;
  is_available?: boolean;
}

export interface StockAdjustment {
  product_id: string;
  variant_id?: string;
  quantity: number;
  operation: "set" | "add" | "subtract";
  reason?: string;
}

class BranchInventoryService {
  /**
   * Get all inventory for a branch
   */
  async getBranchInventory(
    branchId: string,
    brandId: string,
    query: Record<string, unknown>
  ): Promise<{ items: BranchInventory[]; total: number }> {
    // Verify branch belongs to brand
    const { data: branch } = await supabase
      .from("branches")
      .select("id, brand_id")
      .eq("id", branchId)
      .single();

    if (!branch || branch.brand_id !== brandId) {
      throw new NotFoundError("Branch not found or access denied");
    }

    const { limit, offset } = parsePagination(query);
    const lowStockOnly = query.low_stock === "true";
    const search = query.search as string | undefined;

    let dbQuery = supabase
      .from("branch_inventory")
      .select(
        `
        *,
        product:products(id, name, sku, price, images)
      `,
        { count: "exact" }
      )
      .eq("branch_id", branchId)
      .order("updated_at", { ascending: false });

    if (lowStockOnly) {
      dbQuery = dbQuery.lte("stock_quantity", supabase.rpc("get_low_stock_threshold"));
    }

    const { data, error, count } = await dbQuery.range(offset, offset + limit - 1);

    if (error) throw error;

    // Filter by search if provided (product name)
    let items = data || [];
    if (search) {
      const searchLower = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.product?.name?.toLowerCase().includes(searchLower) ||
          item.product?.sku?.toLowerCase().includes(searchLower)
      );
    }

    return {
      items,
      total: count || 0,
    };
  }

  /**
   * Get inventory for a specific product across all branches
   */
  async getProductBranchInventory(
    productId: string,
    brandId: string
  ): Promise<BranchInventory[]> {
    // Verify product belongs to brand
    const { data: product } = await supabase
      .from("products")
      .select("id, brand_id")
      .eq("id", productId)
      .single();

    if (!product || product.brand_id !== brandId) {
      throw new NotFoundError("Product not found or access denied");
    }

    const { data, error } = await supabase
      .from("branch_inventory")
      .select(
        `
        *,
        branch:branches(id, name)
      `
      )
      .eq("product_id", productId);

    if (error) throw error;

    return data || [];
  }

  /**
   * Add a product to a branch's inventory
   */
  async addProductToBranch(
    branchId: string,
    brandId: string,
    input: AddProductToBranchInput
  ): Promise<BranchInventory> {
    // Verify branch belongs to brand
    const { data: branch } = await supabase
      .from("branches")
      .select("id, brand_id")
      .eq("id", branchId)
      .single();

    if (!branch || branch.brand_id !== brandId) {
      throw new NotFoundError("Branch not found or access denied");
    }

    // Verify product belongs to same brand
    const { data: product } = await supabase
      .from("products")
      .select("id, brand_id")
      .eq("id", input.product_id)
      .single();

    if (!product || product.brand_id !== brandId) {
      throw new NotFoundError("Product not found or access denied");
    }

    // Check if already exists
    const { data: existing } = await supabase
      .from("branch_inventory")
      .select("id")
      .eq("branch_id", branchId)
      .eq("product_id", input.product_id)
      .single();

    if (existing) {
      throw new BadRequestError("Product already exists in this branch inventory");
    }

    const { data, error } = await supabase
      .from("branch_inventory")
      .insert({
        branch_id: branchId,
        product_id: input.product_id,
        stock_quantity: input.stock_quantity || 0,
        low_stock_threshold: input.low_stock_threshold || 5,
        is_available: true,
      })
      .select(
        `
        *,
        product:products(id, name, sku, price, images)
      `
      )
      .single();

    if (error) throw error;

    return data;
  }

  /**
   * Update branch inventory for a product
   */
  async updateBranchStock(
    branchId: string,
    productId: string,
    brandId: string,
    input: UpdateBranchStockInput
  ): Promise<BranchInventory> {
    // Verify branch belongs to brand
    const { data: branch } = await supabase
      .from("branches")
      .select("id, brand_id")
      .eq("id", branchId)
      .single();

    if (!branch || branch.brand_id !== brandId) {
      throw new NotFoundError("Branch not found or access denied");
    }

    const { data, error } = await supabase
      .from("branch_inventory")
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq("branch_id", branchId)
      .eq("product_id", productId)
      .select(
        `
        *,
        product:products(id, name, sku, price, images)
      `
      )
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundError("Branch inventory record not found");

    return data;
  }

  /**
   * Remove a product from a branch's inventory
   */
  async removeProductFromBranch(
    branchId: string,
    productId: string,
    brandId: string
  ): Promise<void> {
    // Verify branch belongs to brand
    const { data: branch } = await supabase
      .from("branches")
      .select("id, brand_id")
      .eq("id", branchId)
      .single();

    if (!branch || branch.brand_id !== brandId) {
      throw new NotFoundError("Branch not found or access denied");
    }

    const { error } = await supabase
      .from("branch_inventory")
      .delete()
      .eq("branch_id", branchId)
      .eq("product_id", productId);

    if (error) throw error;
  }

  /**
   * Adjust stock quantity for a product in a branch
   */
  async adjustStock(
    branchId: string,
    brandId: string,
    adjustment: StockAdjustment
  ): Promise<BranchInventory> {
    // Get current inventory
    const { data: current, error: fetchError } = await supabase
      .from("branch_inventory")
      .select("*")
      .eq("branch_id", branchId)
      .eq("product_id", adjustment.product_id)
      .single();

    if (fetchError || !current) {
      throw new NotFoundError("Product not found in branch inventory");
    }

    let newQuantity: number;
    switch (adjustment.operation) {
      case "set":
        newQuantity = adjustment.quantity;
        break;
      case "add":
        newQuantity = current.stock_quantity + adjustment.quantity;
        break;
      case "subtract":
        newQuantity = Math.max(0, current.stock_quantity - adjustment.quantity);
        break;
      default:
        throw new BadRequestError("Invalid operation");
    }

    return this.updateBranchStock(branchId, adjustment.product_id, brandId, {
      stock_quantity: newQuantity,
    });
  }

  /**
   * Get low stock items for a brand across all branches
   */
  async getLowStockItems(brandId: string): Promise<BranchInventory[]> {
    const { data, error } = await supabase
      .from("branch_inventory")
      .select(
        `
        *,
        product:products!inner(id, name, sku, price, images, brand_id),
        branch:branches(id, name)
      `
      )
      .eq("product.brand_id", brandId)
      .filter("stock_quantity", "lte", supabase.rpc("coalesce", { val: "low_stock_threshold", default_val: 5 }));

    if (error) {
      // Fallback: get all and filter in memory
      const { data: allData, error: allError } = await supabase
        .from("branch_inventory")
        .select(
          `
          *,
          product:products!inner(id, name, sku, price, images, brand_id),
          branch:branches(id, name)
        `
        )
        .eq("product.brand_id", brandId);

      if (allError) throw allError;

      return (allData || []).filter(
        (item) => item.stock_quantity <= item.low_stock_threshold
      );
    }

    return data || [];
  }

  /**
   * Bulk add products to a branch
   */
  async bulkAddProductsToBranch(
    branchId: string,
    brandId: string,
    productIds: string[]
  ): Promise<BranchInventory[]> {
    // Verify branch belongs to brand
    const { data: branch } = await supabase
      .from("branches")
      .select("id, brand_id")
      .eq("id", branchId)
      .single();

    if (!branch || branch.brand_id !== brandId) {
      throw new NotFoundError("Branch not found or access denied");
    }

    // Get existing inventory to avoid duplicates
    const { data: existing } = await supabase
      .from("branch_inventory")
      .select("product_id")
      .eq("branch_id", branchId)
      .in("product_id", productIds);

    const existingIds = new Set((existing || []).map((e) => e.product_id));
    const newProductIds = productIds.filter((id) => !existingIds.has(id));

    if (newProductIds.length === 0) {
      return [];
    }

    const insertData = newProductIds.map((productId) => ({
      branch_id: branchId,
      product_id: productId,
      stock_quantity: 0,
      low_stock_threshold: 5,
      is_available: true,
    }));

    const { data, error } = await supabase
      .from("branch_inventory")
      .insert(insertData)
      .select(
        `
        *,
        product:products(id, name, sku, price, images)
      `
      );

    if (error) throw error;

    return data || [];
  }

  /**
   * Get inventory summary for a branch
   */
  async getBranchInventorySummary(
    branchId: string,
    brandId: string
  ): Promise<{
    total_products: number;
    total_stock: number;
    low_stock_count: number;
    out_of_stock_count: number;
  }> {
    // Verify branch belongs to brand
    const { data: branch } = await supabase
      .from("branches")
      .select("id, brand_id")
      .eq("id", branchId)
      .single();

    if (!branch || branch.brand_id !== brandId) {
      throw new NotFoundError("Branch not found or access denied");
    }

    const { data, error } = await supabase
      .from("branch_inventory")
      .select("stock_quantity, low_stock_threshold")
      .eq("branch_id", branchId);

    if (error) throw error;

    const items = data || [];

    return {
      total_products: items.length,
      total_stock: items.reduce((sum, item) => sum + item.stock_quantity, 0),
      low_stock_count: items.filter(
        (item) => item.stock_quantity > 0 && item.stock_quantity <= item.low_stock_threshold
      ).length,
      out_of_stock_count: items.filter((item) => item.stock_quantity === 0).length,
    };
  }
}

export const branchInventoryService = new BranchInventoryService();
