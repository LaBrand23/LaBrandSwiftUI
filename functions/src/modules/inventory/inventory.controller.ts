import { Router, Request, Response } from "express";
import { z } from "zod";
import supabase from "../../config/supabase";
import { verifyAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/roleGuard";
import { UserRole } from "../../config/constants";
import { validateBody } from "../../middleware/validation";
import { success, error, serverError, notFound, forbidden } from "../../utils/response";

const router = Router();

// All inventory routes require authentication
router.use(verifyAuth);

// Validation schema for stock adjustment
const stockAdjustmentSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().optional(),
  quantity: z.number().int().min(0),
  operation: z.enum(["set", "add", "subtract"]),
  reason: z.string().optional(),
});

/**
 * POST /inventory/adjust
 * Adjust stock for a product (Brand Manager)
 */
router.post(
  "/adjust",
  requireRole(UserRole.BRAND_MANAGER),
  validateBody(stockAdjustmentSchema),
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.brandId) {
        error(res, "Brand ID not found for user", 400);
        return;
      }

      const { product_id, variant_id, quantity, operation, reason } = req.body;

      // Get the product and verify it belongs to the brand
      const { data: product } = await supabase
        .from("products")
        .select("id, brand_id, stock_quantity, name")
        .eq("id", product_id)
        .single();

      if (!product) {
        notFound(res, "Product not found");
        return;
      }

      if (product.brand_id !== user.brandId) {
        forbidden(res, "You can only adjust stock for your brand's products");
        return;
      }

      let newQuantity: number;
      const currentQuantity = product.stock_quantity || 0;

      switch (operation) {
        case "set":
          newQuantity = quantity;
          break;
        case "add":
          newQuantity = currentQuantity + quantity;
          break;
        case "subtract":
          newQuantity = Math.max(0, currentQuantity - quantity);
          break;
        default:
          error(res, "Invalid operation", 400);
          return;
      }

      // If variant_id is provided, update variant stock
      if (variant_id) {
        const { data: variant } = await supabase
          .from("product_variants")
          .select("id, stock_quantity")
          .eq("id", variant_id)
          .eq("product_id", product_id)
          .single();

        if (!variant) {
          notFound(res, "Variant not found");
          return;
        }

        const variantCurrentQty = variant.stock_quantity || 0;
        let variantNewQty: number;

        switch (operation) {
          case "set":
            variantNewQty = quantity;
            break;
          case "add":
            variantNewQty = variantCurrentQty + quantity;
            break;
          case "subtract":
            variantNewQty = Math.max(0, variantCurrentQty - quantity);
            break;
          default:
            variantNewQty = quantity;
        }

        const { error: variantError } = await supabase
          .from("product_variants")
          .update({ stock_quantity: variantNewQty })
          .eq("id", variant_id);

        if (variantError) throw variantError;

        // Also update the total product stock by summing all variants
        const { data: allVariants } = await supabase
          .from("product_variants")
          .select("stock_quantity")
          .eq("product_id", product_id);

        const totalStock = allVariants?.reduce((sum, v) => sum + (v.stock_quantity || 0), 0) || 0;

        await supabase
          .from("products")
          .update({ stock_quantity: totalStock })
          .eq("id", product_id);

        newQuantity = totalStock;
      } else {
        // Update product stock directly
        const { error: updateError } = await supabase
          .from("products")
          .update({ stock_quantity: newQuantity })
          .eq("id", product_id);

        if (updateError) throw updateError;
      }

      // Log the stock adjustment (ignore if table doesn't exist)
      try {
        await supabase.from("stock_history").insert({
          product_id,
          variant_id: variant_id || null,
          previous_quantity: currentQuantity,
          new_quantity: newQuantity,
          change_quantity: newQuantity - currentQuantity,
          operation,
          reason: reason || `Manual adjustment by brand manager`,
          adjusted_by: user.userId,
        });
      } catch {
        // Stock history table might not exist, ignore error
        console.log("Stock history logging skipped (table may not exist)");
      }

      // Fetch updated product
      const { data: updatedProduct } = await supabase
        .from("products")
        .select("*")
        .eq("id", product_id)
        .single();

      success(res, updatedProduct, "Stock adjusted successfully");
    } catch (err) {
      console.error("Adjust stock error:", err);
      serverError(res, "Failed to adjust stock");
    }
  }
);

/**
 * GET /inventory/summary
 * Get inventory summary for brand manager's brand
 */
router.get(
  "/summary",
  requireRole(UserRole.BRAND_MANAGER),
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.brandId) {
        error(res, "Brand ID not found for user", 400);
        return;
      }

      // Get all products for this brand
      const { data: products } = await supabase
        .from("products")
        .select("id, stock_quantity, low_stock_threshold, status")
        .eq("brand_id", user.brandId);

      if (!products || products.length === 0) {
        success(res, {
          total_products: 0,
          total_stock: 0,
          in_stock: 0,
          low_stock: 0,
          out_of_stock: 0,
        });
        return;
      }

      const totalStock = products.reduce((sum, p) => sum + (p.stock_quantity || 0), 0);
      const outOfStock = products.filter((p) => p.stock_quantity === 0).length;
      const lowStock = products.filter(
        (p) => p.stock_quantity > 0 && p.stock_quantity <= (p.low_stock_threshold || 5)
      ).length;
      const inStock = products.length - outOfStock - lowStock;

      success(res, {
        total_products: products.length,
        total_stock: totalStock,
        in_stock: inStock,
        low_stock: lowStock,
        out_of_stock: outOfStock,
      });
    } catch (err) {
      console.error("Get inventory summary error:", err);
      serverError(res, "Failed to fetch inventory summary");
    }
  }
);

/**
 * GET /inventory/alerts
 * Get low stock and out of stock alerts for brand
 */
router.get(
  "/alerts",
  requireRole(UserRole.BRAND_MANAGER),
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.brandId) {
        error(res, "Brand ID not found for user", 400);
        return;
      }

      // Get products with low or no stock
      const { data: products } = await supabase
        .from("products")
        .select("id, name, sku, stock_quantity, low_stock_threshold, images")
        .eq("brand_id", user.brandId)
        .or(`stock_quantity.eq.0,stock_quantity.lte.low_stock_threshold`)
        .order("stock_quantity", { ascending: true })
        .limit(50);

      const alerts = (products || []).map((p) => ({
        ...p,
        alert_type: p.stock_quantity === 0 ? "out_of_stock" : "low_stock",
      }));

      success(res, alerts);
    } catch (err) {
      console.error("Get inventory alerts error:", err);
      serverError(res, "Failed to fetch inventory alerts");
    }
  }
);

export default router;
