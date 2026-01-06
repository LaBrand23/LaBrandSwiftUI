import { Router, Request, Response } from "express";
import supabase from "../../config/supabase";
import { verifyAuth } from "../../middleware/auth";
import { validateParams, uuidParam } from "../../middleware/validation";
import { success, created, serverError, notFound } from "../../utils/response";

const router = Router();

/**
 * GET /favorites
 * Get user's favorites
 */
router.get("/", verifyAuth, async (req: Request, res: Response) => {
  try {
    const { data, error: dbError } = await supabase
      .from("favorites")
      .select(`
        id,
        created_at,
        product:products(
          id, name, slug, price, sale_price, is_on_sale,
          brand:brands(id, name, slug),
          images:product_images(image_url, is_primary)
        )
      `)
      .eq("user_id", req.user!.userId)
      .order("created_at", { ascending: false });

    if (dbError) throw dbError;

    success(res, data || []);
  } catch (err) {
    console.error("Get favorites error:", err);
    serverError(res, "Failed to fetch favorites");
  }
});

/**
 * POST /favorites/:productId
 * Add product to favorites
 */
router.post(
  "/:id",
  verifyAuth,
  validateParams(uuidParam),
  async (req: Request, res: Response) => {
    try {
      // Check if product exists
      const { data: product } = await supabase
        .from("products")
        .select("id")
        .eq("id", req.params.id)
        .single();

      if (!product) {
        notFound(res, "Product not found");
        return;
      }

      // Add to favorites (upsert to avoid duplicates)
      const { data, error: dbError } = await supabase
        .from("favorites")
        .upsert({
          user_id: req.user!.userId,
          product_id: req.params.id,
        }, {
          onConflict: "user_id,product_id",
        })
        .select()
        .single();

      if (dbError) throw dbError;

      created(res, data, "Added to favorites");
    } catch (err) {
      console.error("Add to favorites error:", err);
      serverError(res, "Failed to add to favorites");
    }
  }
);

/**
 * DELETE /favorites/:productId
 * Remove product from favorites
 */
router.delete(
  "/:id",
  verifyAuth,
  validateParams(uuidParam),
  async (req: Request, res: Response) => {
    try {
      const { error: dbError } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", req.user!.userId)
        .eq("product_id", req.params.id);

      if (dbError) throw dbError;

      success(res, null, "Removed from favorites");
    } catch (err) {
      console.error("Remove from favorites error:", err);
      serverError(res, "Failed to remove from favorites");
    }
  }
);

/**
 * GET /favorites/check/:productId
 * Check if product is in favorites
 */
router.get(
  "/check/:id",
  verifyAuth,
  validateParams(uuidParam),
  async (req: Request, res: Response) => {
    try {
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", req.user!.userId)
        .eq("product_id", req.params.id)
        .single();

      success(res, { isFavorite: !!data });
    } catch (err) {
      success(res, { isFavorite: false });
    }
  }
);

export default router;

