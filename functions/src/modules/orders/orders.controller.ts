import { Router, Request, Response } from "express";
import { z } from "zod";
import { ordersService } from "./orders.service";
import { verifyAuth } from "../../middleware/auth";
import { requireBrandManager } from "../../middleware/roleGuard";
import { validateBody, validateParams, uuidParam } from "../../middleware/validation";
import { success, created, paginated, error, serverError } from "../../utils/response";
import { ApiError } from "../../utils/errors";
import { OrderStatus } from "../../config/constants";

const router = Router();

// Validation schemas
const createOrderSchema = z.object({
  items: z.array(z.object({
    product_id: z.string().uuid(),
    variant_id: z.string().uuid().optional(),
    quantity: z.number().int().min(1),
  })).min(1),
  shipping_address: z.object({
    full_name: z.string().min(1),
    phone: z.string().min(1),
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().optional(),
    postal_code: z.string().min(1),
    country: z.string().min(1),
  }),
  promo_code: z.string().optional(),
  notes: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]),
});

/**
 * GET /orders
 * Get orders (role-filtered)
 */
router.get("/", verifyAuth, async (req: Request, res: Response) => {
  try {
    const { orders, total } = await ordersService.getOrders(
      req.query as Record<string, unknown>,
      req.user!.userId,
      req.user!.role,
      req.user!.brandId
    );

    const page = parseInt(String(req.query.page || "1"), 10);
    const limit = parseInt(String(req.query.limit || "20"), 10);
    paginated(res, orders, { page, limit, total });
  } catch (err) {
    console.error("Get orders error:", err);
    serverError(res, "Failed to fetch orders");
  }
});

/**
 * GET /orders/:id
 * Get order by ID
 */
router.get(
  "/:id",
  verifyAuth,
  validateParams(uuidParam),
  async (req: Request, res: Response) => {
    try {
      const order = await ordersService.getOrderById(req.params.id);
      success(res, order);
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Get order error:", err);
      serverError(res, "Failed to fetch order");
    }
  }
);

/**
 * POST /orders
 * Create a new order (Client)
 */
router.post(
  "/",
  verifyAuth,
  validateBody(createOrderSchema),
  async (req: Request, res: Response) => {
    try {
      const order = await ordersService.createOrder(req.user!.userId, req.body);
      created(res, order, "Order created successfully");
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Create order error:", err);
      serverError(res, "Failed to create order");
    }
  }
);

/**
 * PUT /orders/:id/status
 * Update order status (Brand Manager/Admin)
 */
router.put(
  "/:id/status",
  verifyAuth,
  requireBrandManager,
  validateParams(uuidParam),
  validateBody(updateStatusSchema),
  async (req: Request, res: Response) => {
    try {
      const order = await ordersService.updateOrderStatus(
        req.params.id,
        req.body.status as OrderStatus,
        req.user!.userId,
        req.user!.role,
        req.user!.brandId
      );
      success(res, order, "Order status updated successfully");
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Update order status error:", err);
      serverError(res, "Failed to update order status");
    }
  }
);

/**
 * POST /orders/:id/cancel
 * Cancel order (Client - own orders only)
 */
router.post(
  "/:id/cancel",
  verifyAuth,
  validateParams(uuidParam),
  async (req: Request, res: Response) => {
    try {
      const order = await ordersService.cancelOrder(req.params.id, req.user!.userId);
      success(res, order, "Order cancelled successfully");
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Cancel order error:", err);
      serverError(res, "Failed to cancel order");
    }
  }
);

export default router;

