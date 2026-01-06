import { Router, Request, Response } from "express";
import { z } from "zod";
import supabase from "../../config/supabase";
import { verifyAuth, optionalAuth } from "../../middleware/auth";
// Role guards available if needed
import { validateBody, validateParams, uuidParam } from "../../middleware/validation";
import { success, created, paginated, error, serverError, notFound, forbidden } from "../../utils/response";
import { parsePagination } from "../../utils/helpers";

const router = Router();

// Validation schemas
const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(255).optional(),
  comment: z.string().optional(),
  images: z.array(z.string().url()).optional(),
});

/**
 * GET /reviews/product/:productId
 * Get reviews for a product (public)
 */
router.get("/product/:id", optionalAuth, validateParams(uuidParam), async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);

    const { data, error: dbError, count } = await supabase
      .from("reviews")
      .select(`
        *,
        user:users(id, full_name, avatar_url)
      `, { count: "exact" })
      .eq("product_id", req.params.id)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (dbError) throw dbError;

    paginated(res, data || [], { page, limit, total: count || 0 });
  } catch (err) {
    console.error("Get reviews error:", err);
    serverError(res, "Failed to fetch reviews");
  }
});

/**
 * POST /reviews/product/:productId
 * Add a review (Client)
 */
router.post(
  "/product/:id",
  verifyAuth,
  validateParams(uuidParam),
  validateBody(createReviewSchema),
  async (req: Request, res: Response) => {
    try {
      // Check if user already reviewed this product
      const { data: existing } = await supabase
        .from("reviews")
        .select("id")
        .eq("user_id", req.user!.userId)
        .eq("product_id", req.params.id)
        .single();

      if (existing) {
        error(res, "You have already reviewed this product", 409);
        return;
      }

      // Check if user purchased this product
      const { data: purchase } = await supabase
        .from("order_items")
        .select("id, order:orders!inner(user_id, status)")
        .eq("product_id", req.params.id)
        .eq("order.user_id", req.user!.userId)
        .eq("order.status", "delivered")
        .limit(1);

      const isVerifiedPurchase = purchase && purchase.length > 0;

      const { data, error: dbError } = await supabase
        .from("reviews")
        .insert({
          user_id: req.user!.userId,
          product_id: req.params.id,
          rating: req.body.rating,
          title: req.body.title,
          comment: req.body.comment,
          images: req.body.images || [],
          is_verified_purchase: isVerifiedPurchase,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      created(res, data, "Review added successfully");
    } catch (err) {
      console.error("Add review error:", err);
      serverError(res, "Failed to add review");
    }
  }
);

/**
 * PUT /reviews/:id
 * Update a review (Owner only)
 */
router.put(
  "/:id",
  verifyAuth,
  validateParams(uuidParam),
  validateBody(createReviewSchema.partial()),
  async (req: Request, res: Response) => {
    try {
      // Check ownership
      const { data: review } = await supabase
        .from("reviews")
        .select("user_id")
        .eq("id", req.params.id)
        .single();

      if (!review) {
        notFound(res, "Review not found");
        return;
      }

      if (review.user_id !== req.user!.userId) {
        forbidden(res, "You can only edit your own reviews");
        return;
      }

      const { data, error: dbError } = await supabase
        .from("reviews")
        .update(req.body)
        .eq("id", req.params.id)
        .select()
        .single();

      if (dbError) throw dbError;

      success(res, data, "Review updated successfully");
    } catch (err) {
      console.error("Update review error:", err);
      serverError(res, "Failed to update review");
    }
  }
);

/**
 * DELETE /reviews/:id
 * Delete a review (Owner or Admin)
 */
router.delete(
  "/:id",
  verifyAuth,
  validateParams(uuidParam),
  async (req: Request, res: Response) => {
    try {
      // Check ownership (unless admin)
      const { data: review } = await supabase
        .from("reviews")
        .select("user_id")
        .eq("id", req.params.id)
        .single();

      if (!review) {
        notFound(res, "Review not found");
        return;
      }

      if (review.user_id !== req.user!.userId && 
          req.user!.role !== "admin" && 
          req.user!.role !== "root_admin") {
        forbidden(res, "You can only delete your own reviews");
        return;
      }

      const { error: dbError } = await supabase
        .from("reviews")
        .delete()
        .eq("id", req.params.id);

      if (dbError) throw dbError;

      success(res, null, "Review deleted successfully");
    } catch (err) {
      console.error("Delete review error:", err);
      serverError(res, "Failed to delete review");
    }
  }
);

/**
 * POST /reviews/:id/helpful
 * Mark review as helpful
 */
router.post(
  "/:id/helpful",
  verifyAuth,
  validateParams(uuidParam),
  async (req: Request, res: Response) => {
    try {
      const { error: dbError } = await supabase.rpc("increment_helpful_count", {
        review_id: req.params.id,
      });

      if (dbError) {
        // Fallback to manual increment
        const { data: review } = await supabase
          .from("reviews")
          .select("helpful_count")
          .eq("id", req.params.id)
          .single();

        if (review) {
          await supabase
            .from("reviews")
            .update({ helpful_count: (review.helpful_count || 0) + 1 })
            .eq("id", req.params.id);
        }
      }

      success(res, null, "Marked as helpful");
    } catch (err) {
      console.error("Mark helpful error:", err);
      serverError(res, "Failed to mark as helpful");
    }
  }
);

export default router;

