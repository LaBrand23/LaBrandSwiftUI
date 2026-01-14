import { Router, Request, Response } from "express";
import { z } from "zod";
import { productsService } from "./products.service";
import { verifyAuth, optionalAuth } from "../../middleware/auth";
import { requireBrandManager } from "../../middleware/roleGuard";
import { validateBody, validateParams, uuidParam } from "../../middleware/validation";
import { success, created, paginated, error, serverError } from "../../utils/response";
import { ApiError } from "../../utils/errors";
import { UserRole } from "../../config/constants";

const router = Router();

// Validation schemas
const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  category_id: z.string().uuid(),
  primary_branch_id: z.string().uuid(),
  description: z.string().optional(),
  price: z.number().positive(),
  sale_price: z.number().positive().optional(),
  is_new: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  stock_quantity: z.number().int().min(0).optional(),
});

const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  category_id: z.string().uuid().optional(),
  primary_branch_id: z.string().uuid().optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  sale_price: z.number().positive().nullable().optional(),
  is_new: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  stock_quantity: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

const variantSchema = z.object({
  size: z.string().optional(),
  color: z.string().optional(),
  color_hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  stock: z.number().int().min(0).optional(),
  sku: z.string().optional(),
  price_adjustment: z.number().optional(),
});

const imageSchema = z.object({
  image_url: z.string().url(),
  alt_text: z.string().optional(),
  position: z.number().int().min(0).optional(),
  is_primary: z.boolean().optional(),
});

/**
 * GET /products
 * Get products with filters (public)
 */
router.get("/", optionalAuth, async (req: Request, res: Response) => {
  try {
    const filters = {
      category_id: req.query.category_id as string | undefined,
      brand_id: req.query.brand_id as string | undefined,
      is_new: req.query.is_new === "true" ? true : undefined,
      is_featured: req.query.is_featured === "true" ? true : undefined,
      is_on_sale: req.query.is_on_sale === "true" ? true : undefined,
      min_price: req.query.min_price ? parseFloat(req.query.min_price as string) : undefined,
      max_price: req.query.max_price ? parseFloat(req.query.max_price as string) : undefined,
      search: req.query.search as string | undefined,
    };

    const { products, total } = await productsService.getProducts(
      req.query as Record<string, unknown>,
      filters
    );

    const page = parseInt(String(req.query.page || "1"), 10);
    const limit = parseInt(String(req.query.limit || "20"), 10);
    paginated(res, products, { page, limit, total });
  } catch (err) {
    console.error("Get products error:", err);
    serverError(res, "Failed to fetch products");
  }
});

/**
 * GET /products/:id
 * Get product by ID (public)
 */
router.get("/:id", validateParams(uuidParam), async (req: Request, res: Response) => {
  try {
    const product = await productsService.getProductById(req.params.id);
    success(res, product);
  } catch (err) {
    if (err instanceof ApiError) {
      error(res, err.message, err.statusCode);
      return;
    }
    console.error("Get product error:", err);
    serverError(res, "Failed to fetch product");
  }
});

/**
 * POST /products
 * Create a product (Brand Manager - own brand only)
 */
router.post(
  "/",
  verifyAuth,
  requireBrandManager,
  validateBody(createProductSchema),
  async (req: Request, res: Response) => {
    try {
      // Brand managers can only create for their brand
      let brandId = req.body.brand_id;
      
      if (req.user?.role === UserRole.BRAND_MANAGER) {
        if (!req.user.brandId) {
          error(res, "You are not assigned to any brand", 403);
          return;
        }
        brandId = req.user.brandId;
      }

      if (!brandId) {
        error(res, "Brand ID is required", 400);
        return;
      }

      const product = await productsService.createProduct(brandId, req.body);
      created(res, product, "Product created successfully");
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Create product error:", err);
      serverError(res, "Failed to create product");
    }
  }
);

/**
 * PUT /products/:id
 * Update a product
 */
router.put(
  "/:id",
  verifyAuth,
  requireBrandManager,
  validateParams(uuidParam),
  validateBody(updateProductSchema),
  async (req: Request, res: Response) => {
    try {
      // Verify access to product's brand
      const existingProduct = await productsService.getProductById(req.params.id);
      
      if (req.user?.role === UserRole.BRAND_MANAGER) {
        if (existingProduct.brand_id !== req.user.brandId) {
          error(res, "You can only update your own brand's products", 403);
          return;
        }
      }

      const product = await productsService.updateProduct(req.params.id, req.body, existingProduct.brand_id);
      success(res, product, "Product updated successfully");
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Update product error:", err);
      serverError(res, "Failed to update product");
    }
  }
);

/**
 * DELETE /products/:id
 * Delete a product
 */
router.delete(
  "/:id",
  verifyAuth,
  requireBrandManager,
  validateParams(uuidParam),
  async (req: Request, res: Response) => {
    try {
      await productsService.deleteProduct(req.params.id);
      success(res, null, "Product deleted successfully");
    } catch (err) {
      console.error("Delete product error:", err);
      serverError(res, "Failed to delete product");
    }
  }
);

/**
 * POST /products/:id/variants
 * Add a variant to a product
 */
router.post(
  "/:id/variants",
  verifyAuth,
  requireBrandManager,
  validateParams(uuidParam),
  validateBody(variantSchema),
  async (req: Request, res: Response) => {
    try {
      const variant = await productsService.addVariant(req.params.id, req.body);
      created(res, variant, "Variant added successfully");
    } catch (err) {
      console.error("Add variant error:", err);
      serverError(res, "Failed to add variant");
    }
  }
);

/**
 * POST /products/:id/images
 * Add an image to a product
 */
router.post(
  "/:id/images",
  verifyAuth,
  requireBrandManager,
  validateParams(uuidParam),
  validateBody(imageSchema),
  async (req: Request, res: Response) => {
    try {
      const image = await productsService.addImage(req.params.id, req.body);
      created(res, image, "Image added successfully");
    } catch (err) {
      console.error("Add image error:", err);
      serverError(res, "Failed to add image");
    }
  }
);

export default router;

