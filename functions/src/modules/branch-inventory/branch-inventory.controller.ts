import { Router, Request, Response } from "express";
import { z } from "zod";
import { branchInventoryService } from "./branch-inventory.service";
import { verifyAuth } from "../../middleware/auth";
import { requireBrandManager } from "../../middleware/roleGuard";
import { validateBody, validateParams, uuidParam } from "../../middleware/validation";
import { success, paginated, error, serverError, created } from "../../utils/response";
import { ApiError } from "../../utils/errors";

const router = Router();

// Validation schemas
const addProductSchema = z.object({
  product_id: z.string().uuid(),
  stock_quantity: z.number().int().min(0).optional(),
  low_stock_threshold: z.number().int().min(0).optional(),
});

const updateStockSchema = z.object({
  stock_quantity: z.number().int().min(0).optional(),
  low_stock_threshold: z.number().int().min(0).optional(),
  is_available: z.boolean().optional(),
});

const adjustStockSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().optional(),
  quantity: z.number().int().min(0),
  operation: z.enum(["set", "add", "subtract"]),
  reason: z.string().optional(),
});

const bulkAddSchema = z.object({
  product_ids: z.array(z.string().uuid()).min(1),
});

const branchIdParam = z.object({
  branchId: z.string().uuid(),
});

const branchProductParams = z.object({
  branchId: z.string().uuid(),
  productId: z.string().uuid(),
});

/**
 * GET /branch-inventory/:branchId
 * Get all inventory for a branch
 */
router.get(
  "/:branchId",
  verifyAuth,
  requireBrandManager,
  validateParams(branchIdParam),
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.brandId) {
        error(res, "Brand ID not found for user", 400);
        return;
      }

      const { items, total } = await branchInventoryService.getBranchInventory(
        req.params.branchId,
        user.brandId,
        req.query as Record<string, unknown>
      );

      const page = parseInt(String(req.query.page || "1"), 10);
      const limit = parseInt(String(req.query.limit || "20"), 10);

      paginated(res, items, { page, limit, total });
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Get branch inventory error:", err);
      serverError(res, "Failed to fetch branch inventory");
    }
  }
);

/**
 * GET /branch-inventory/:branchId/summary
 * Get inventory summary for a branch
 */
router.get(
  "/:branchId/summary",
  verifyAuth,
  requireBrandManager,
  validateParams(branchIdParam),
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.brandId) {
        error(res, "Brand ID not found for user", 400);
        return;
      }

      const summary = await branchInventoryService.getBranchInventorySummary(
        req.params.branchId,
        user.brandId
      );

      success(res, summary);
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Get branch inventory summary error:", err);
      serverError(res, "Failed to fetch inventory summary");
    }
  }
);

/**
 * POST /branch-inventory/:branchId/products
 * Add a product to branch inventory
 */
router.post(
  "/:branchId/products",
  verifyAuth,
  requireBrandManager,
  validateParams(branchIdParam),
  validateBody(addProductSchema),
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.brandId) {
        error(res, "Brand ID not found for user", 400);
        return;
      }

      const inventory = await branchInventoryService.addProductToBranch(
        req.params.branchId,
        user.brandId,
        req.body
      );

      created(res, inventory, "Product added to branch inventory");
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Add product to branch error:", err);
      serverError(res, "Failed to add product to branch");
    }
  }
);

/**
 * POST /branch-inventory/:branchId/products/bulk
 * Bulk add products to branch inventory
 */
router.post(
  "/:branchId/products/bulk",
  verifyAuth,
  requireBrandManager,
  validateParams(branchIdParam),
  validateBody(bulkAddSchema),
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.brandId) {
        error(res, "Brand ID not found for user", 400);
        return;
      }

      const inventory = await branchInventoryService.bulkAddProductsToBranch(
        req.params.branchId,
        user.brandId,
        req.body.product_ids
      );

      created(res, inventory, `${inventory.length} products added to branch`);
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Bulk add products error:", err);
      serverError(res, "Failed to add products to branch");
    }
  }
);

/**
 * PATCH /branch-inventory/:branchId/products/:productId
 * Update branch inventory for a product
 */
router.patch(
  "/:branchId/products/:productId",
  verifyAuth,
  requireBrandManager,
  validateParams(branchProductParams),
  validateBody(updateStockSchema),
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.brandId) {
        error(res, "Brand ID not found for user", 400);
        return;
      }

      const inventory = await branchInventoryService.updateBranchStock(
        req.params.branchId,
        req.params.productId,
        user.brandId,
        req.body
      );

      success(res, inventory, "Branch inventory updated");
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Update branch stock error:", err);
      serverError(res, "Failed to update branch inventory");
    }
  }
);

/**
 * POST /branch-inventory/:branchId/adjust
 * Adjust stock quantity for a product
 */
router.post(
  "/:branchId/adjust",
  verifyAuth,
  requireBrandManager,
  validateParams(branchIdParam),
  validateBody(adjustStockSchema),
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.brandId) {
        error(res, "Brand ID not found for user", 400);
        return;
      }

      const inventory = await branchInventoryService.adjustStock(
        req.params.branchId,
        user.brandId,
        req.body
      );

      success(res, inventory, "Stock adjusted successfully");
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Adjust stock error:", err);
      serverError(res, "Failed to adjust stock");
    }
  }
);

/**
 * DELETE /branch-inventory/:branchId/products/:productId
 * Remove a product from branch inventory
 */
router.delete(
  "/:branchId/products/:productId",
  verifyAuth,
  requireBrandManager,
  validateParams(branchProductParams),
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.brandId) {
        error(res, "Brand ID not found for user", 400);
        return;
      }

      await branchInventoryService.removeProductFromBranch(
        req.params.branchId,
        req.params.productId,
        user.brandId
      );

      success(res, null, "Product removed from branch inventory");
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Remove product from branch error:", err);
      serverError(res, "Failed to remove product from branch");
    }
  }
);

/**
 * GET /branch-inventory/product/:productId
 * Get inventory for a product across all branches
 */
router.get(
  "/product/:id",
  verifyAuth,
  requireBrandManager,
  validateParams(uuidParam),
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.brandId) {
        error(res, "Brand ID not found for user", 400);
        return;
      }

      const inventory = await branchInventoryService.getProductBranchInventory(
        req.params.id,
        user.brandId
      );

      success(res, inventory);
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Get product branch inventory error:", err);
      serverError(res, "Failed to fetch product inventory");
    }
  }
);

/**
 * GET /branch-inventory/low-stock
 * Get low stock items across all branches
 */
router.get(
  "/low-stock",
  verifyAuth,
  requireBrandManager,
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.brandId) {
        error(res, "Brand ID not found for user", 400);
        return;
      }

      const items = await branchInventoryService.getLowStockItems(user.brandId);

      success(res, items);
    } catch (err) {
      console.error("Get low stock items error:", err);
      serverError(res, "Failed to fetch low stock items");
    }
  }
);

export default router;
