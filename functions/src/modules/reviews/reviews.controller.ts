import { Router, Request, Response } from "express";
import { z } from "zod";
import supabase from "../../config/supabase";
import { verifyAuth, optionalAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/roleGuard";
import { UserRole } from "../../config/constants";
import { validateBody, validateParams, uuidParam } from "../../middleware/validation";
import { success, created, paginated, error, serverError, notFound, forbidden } from "../../utils/response";
import { parsePagination } from "../../utils/helpers";
import { notificationsService } from "../notifications/notifications.service";

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

      // Get product info for notification
      const { data: product } = await supabase
        .from("products")
        .select("id, name, brand_id")
        .eq("id", req.params.id)
        .single();

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

      // Create notification for brand manager
      if (product?.brand_id) {
        try {
          const stars = "★".repeat(req.body.rating) + "☆".repeat(5 - req.body.rating);
          await notificationsService.createBrandNotification(
            product.brand_id,
            "new_review",
            "New Review Received",
            `${stars} review on "${product.name}"${req.body.title ? `: "${req.body.title}"` : ""}`,
            {
              review_id: data.id,
              product_id: product.id,
              product_name: product.name,
              rating: req.body.rating,
            }
          );
        } catch (notificationError) {
          console.error("Failed to create review notification:", notificationError);
          // Don't fail the review creation if notification fails
        }
      }

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

// ==========================================
// Brand Manager Endpoints
// ==========================================

/**
 * GET /reviews
 * Get all reviews for brand manager's brand
 */
router.get(
  "/",
  verifyAuth,
  requireRole(UserRole.BRAND_MANAGER),
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.brandId) {
        error(res, "Brand ID not found for user", 400);
        return;
      }

      const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);
      const rating = req.query.rating ? parseInt(req.query.rating as string) : undefined;

      // Get products for this brand first
      const { data: brandProducts } = await supabase
        .from("products")
        .select("id")
        .eq("brand_id", user.brandId);

      if (!brandProducts || brandProducts.length === 0) {
        paginated(res, [], { page, limit, total: 0 });
        return;
      }

      const productIds = brandProducts.map((p) => p.id);

      // Build query
      let query = supabase
        .from("reviews")
        .select(`
          *,
          user:users(id, full_name, avatar_url, email),
          product:products(id, name)
        `, { count: "exact" })
        .in("product_id", productIds)
        .order("created_at", { ascending: false });

      if (rating) {
        query = query.eq("rating", rating);
      }

      const { data, error: dbError, count } = await query.range(offset, offset + limit - 1);

      if (dbError) throw dbError;

      paginated(res, data || [], { page, limit, total: count || 0 });
    } catch (err) {
      console.error("Get brand reviews error:", err);
      serverError(res, "Failed to fetch reviews");
    }
  }
);

/**
 * GET /reviews/stats
 * Get review statistics for brand manager's brand
 */
router.get(
  "/stats",
  verifyAuth,
  requireRole(UserRole.BRAND_MANAGER),
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.brandId) {
        error(res, "Brand ID not found for user", 400);
        return;
      }

      // Get products for this brand
      const { data: brandProducts } = await supabase
        .from("products")
        .select("id")
        .eq("brand_id", user.brandId);

      if (!brandProducts || brandProducts.length === 0) {
        success(res, {
          total: 0,
          pending: 0,
          approved: 0,
          average_rating: 0,
          by_rating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
        return;
      }

      const productIds = brandProducts.map((p) => p.id);

      // Get all reviews for brand's products
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating, is_approved")
        .in("product_id", productIds);

      if (!reviews || reviews.length === 0) {
        success(res, {
          total: 0,
          pending: 0,
          approved: 0,
          average_rating: 0,
          by_rating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
        return;
      }

      // Calculate stats
      const total = reviews.length;
      const approved = reviews.filter((r) => r.is_approved).length;
      const pending = total - approved;
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = total > 0 ? totalRating / total : 0;

      const byRating: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach((r) => {
        byRating[r.rating] = (byRating[r.rating] || 0) + 1;
      });

      success(res, {
        total,
        pending,
        approved,
        average_rating: Math.round(averageRating * 10) / 10,
        by_rating: byRating,
      });
    } catch (err) {
      console.error("Get brand review stats error:", err);
      serverError(res, "Failed to fetch review statistics");
    }
  }
);

// Validation schema for response
const respondToReviewSchema = z.object({
  text: z.string().min(1).max(1000),
});

/**
 * POST /reviews/:id/respond
 * Respond to a review (Brand Manager)
 */
router.post(
  "/:id/respond",
  verifyAuth,
  requireRole(UserRole.BRAND_MANAGER),
  validateParams(uuidParam),
  validateBody(respondToReviewSchema),
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.brandId) {
        error(res, "Brand ID not found for user", 400);
        return;
      }

      // Get the review with product info
      const { data: review } = await supabase
        .from("reviews")
        .select(`
          *,
          product:products(id, brand_id)
        `)
        .eq("id", req.params.id)
        .single();

      if (!review) {
        notFound(res, "Review not found");
        return;
      }

      // Check if review belongs to brand's product
      if (review.product?.brand_id !== user.brandId) {
        forbidden(res, "You can only respond to reviews for your brand's products");
        return;
      }

      // Update review with response
      const { data: updatedReview, error: dbError } = await supabase
        .from("reviews")
        .update({
          response: {
            text: req.body.text,
            responded_at: new Date().toISOString(),
            responded_by: user.userId,
          },
        })
        .eq("id", req.params.id)
        .select(`
          *,
          user:users(id, full_name, avatar_url),
          product:products(id, name)
        `)
        .single();

      if (dbError) throw dbError;

      success(res, updatedReview, "Response added successfully");
    } catch (err) {
      console.error("Respond to review error:", err);
      serverError(res, "Failed to respond to review");
    }
  }
);

export default router;

