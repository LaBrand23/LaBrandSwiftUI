import { Router, Request, Response } from "express";
import { z } from "zod";
import { categoriesService } from "./categories.service";
import { verifyAuth } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/roleGuard";
import { validateBody, validateParams, uuidParam } from "../../middleware/validation";
import { success, created, error, notFound, serverError } from "../../utils/response";
import { ApiError } from "../../utils/errors";

const router = Router();

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1).max(255),
  parent_id: z.string().uuid().optional(),
  image_url: z.string().url().optional(),
  gender: z.enum(["men", "women", "kids", "unisex"]).optional(),
  position: z.number().int().min(0).optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  image_url: z.string().url().optional(),
  position: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

/**
 * GET /categories
 * Get category tree (public)
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const categories = await categoriesService.getCategoryTree();
    success(res, categories);
  } catch (err) {
    console.error("Get categories error:", err);
    serverError(res, "Failed to fetch categories");
  }
});

/**
 * GET /categories/:id
 * Get category by ID (public)
 */
router.get("/:id", validateParams(uuidParam), async (req: Request, res: Response) => {
  try {
    const category = await categoriesService.getCategoryById(req.params.id);
    success(res, category);
  } catch (err) {
    if (err instanceof ApiError) {
      error(res, err.message, err.statusCode);
      return;
    }
    console.error("Get category error:", err);
    serverError(res, "Failed to fetch category");
  }
});

/**
 * GET /categories/slug/:slug
 * Get category by slug (public)
 */
router.get("/slug/:slug", async (req: Request, res: Response) => {
  try {
    const category = await categoriesService.getCategoryBySlug(req.params.slug);
    success(res, category);
  } catch (err) {
    if (err instanceof ApiError) {
      notFound(res, err.message);
      return;
    }
    console.error("Get category by slug error:", err);
    serverError(res, "Failed to fetch category");
  }
});

/**
 * POST /categories
 * Create a new category (Admin only)
 */
router.post(
  "/",
  verifyAuth,
  requireAdmin,
  validateBody(createCategorySchema),
  async (req: Request, res: Response) => {
    try {
      const category = await categoriesService.createCategory(req.body);
      created(res, category, "Category created successfully");
    } catch (err) {
      if (err instanceof Error) {
        error(res, err.message);
        return;
      }
      console.error("Create category error:", err);
      serverError(res, "Failed to create category");
    }
  }
);

/**
 * PUT /categories/:id
 * Update a category (Admin only)
 */
router.put(
  "/:id",
  verifyAuth,
  requireAdmin,
  validateParams(uuidParam),
  validateBody(updateCategorySchema),
  async (req: Request, res: Response) => {
    try {
      const category = await categoriesService.updateCategory(req.params.id, req.body);
      success(res, category, "Category updated successfully");
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Update category error:", err);
      serverError(res, "Failed to update category");
    }
  }
);

/**
 * DELETE /categories/:id
 * Delete (deactivate) a category (Admin only)
 */
router.delete(
  "/:id",
  verifyAuth,
  requireAdmin,
  validateParams(uuidParam),
  async (req: Request, res: Response) => {
    try {
      await categoriesService.deleteCategory(req.params.id);
      success(res, null, "Category deleted successfully");
    } catch (err) {
      console.error("Delete category error:", err);
      serverError(res, "Failed to delete category");
    }
  }
);

export default router;

