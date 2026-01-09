import { Router, Request, Response } from "express";
import { z } from "zod";
import { brandsService } from "./brands.service";
import { verifyAuth } from "../../middleware/auth";
import { requireAdmin, requireBrandManager, requireBrandAccess } from "../../middleware/roleGuard";
import { validateBody, validateParams, uuidParam } from "../../middleware/validation";
import { success, created, paginated, error, serverError } from "../../utils/response";
import { ApiError } from "../../utils/errors";

const router = Router();

// Validation schemas
const createBrandSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  is_featured: z.boolean().optional(),
});

const updateBrandSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  logo_url: z.string().url().optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});

const createBranchSchema = z.object({
  name: z.string().min(1).max(255),
  address: z.string().min(1),
  city: z.string().optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  phone: z.string().optional(),
  working_hours: z.record(z.string()).optional(),
});

/**
 * GET /brands
 * Get all brands (public)
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { brands, total } = await brandsService.getBrands(req.query as Record<string, unknown>);
    const page = parseInt(String(req.query.page || "1"), 10);
    const limit = parseInt(String(req.query.limit || "20"), 10);
    paginated(res, brands, { page, limit, total });
  } catch (err) {
    console.error("Get brands error:", err);
    serverError(res, "Failed to fetch brands");
  }
});

/**
 * GET /brands/:id
 * Get brand by ID with branches (public)
 */
router.get("/:id", validateParams(uuidParam), async (req: Request, res: Response) => {
  try {
    const brand = await brandsService.getBrandById(req.params.id);
    success(res, brand);
  } catch (err) {
    if (err instanceof ApiError) {
      error(res, err.message, err.statusCode);
      return;
    }
    console.error("Get brand error:", err);
    serverError(res, "Failed to fetch brand");
  }
});

/**
 * POST /brands
 * Create a new brand (Admin only)
 */
router.post(
  "/",
  verifyAuth,
  requireAdmin,
  validateBody(createBrandSchema),
  async (req: Request, res: Response) => {
    try {
      const brand = await brandsService.createBrand(req.body);
      created(res, brand, "Brand created successfully");
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Create brand error:", err);
      serverError(res, "Failed to create brand");
    }
  }
);

/**
 * PUT /brands/:id
 * Update a brand (Admin or Brand Manager)
 */
router.put(
  "/:id",
  verifyAuth,
  requireBrandManager,
  requireBrandAccess((req) => req.params.id),
  validateParams(uuidParam),
  validateBody(updateBrandSchema),
  async (req: Request, res: Response) => {
    try {
      const brand = await brandsService.updateBrand(req.params.id, req.body);
      success(res, brand, "Brand updated successfully");
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Update brand error:", err);
      serverError(res, "Failed to update brand");
    }
  }
);

/**
 * DELETE /brands/:id
 * Delete (deactivate) a brand (Admin only)
 */
router.delete(
  "/:id",
  verifyAuth,
  requireAdmin,
  validateParams(uuidParam),
  async (req: Request, res: Response) => {
    try {
      await brandsService.deleteBrand(req.params.id);
      success(res, null, "Brand deleted successfully");
    } catch (err) {
      console.error("Delete brand error:", err);
      serverError(res, "Failed to delete brand");
    }
  }
);

/**
 * GET /brands/:id/branches
 * Get branches for a brand (public)
 */
router.get("/:id/branches", validateParams(uuidParam), async (req: Request, res: Response) => {
  try {
    const branches = await brandsService.getBranches(req.params.id);
    success(res, branches);
  } catch (err) {
    console.error("Get branches error:", err);
    serverError(res, "Failed to fetch branches");
  }
});

/**
 * POST /brands/:id/branches
 * Create a branch (Brand Manager)
 */
router.post(
  "/:id/branches",
  verifyAuth,
  requireBrandManager,
  requireBrandAccess((req) => req.params.id),
  validateParams(uuidParam),
  validateBody(createBranchSchema),
  async (req: Request, res: Response) => {
    try {
      const branch = await brandsService.createBranch(req.params.id, req.body);
      created(res, branch, "Branch created successfully");
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Create branch error:", err);
      serverError(res, "Failed to create branch");
    }
  }
);

/**
 * POST /brands/:brandId/managers/:userId
 * Assign a manager to a brand (Admin only)
 */
router.post(
  "/:brandId/managers/:userId",
  verifyAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      await brandsService.assignManager(req.params.brandId, req.params.userId);
      success(res, null, "Manager assigned successfully");
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Assign manager error:", err);
      serverError(res, "Failed to assign manager");
    }
  }
);

export default router;

