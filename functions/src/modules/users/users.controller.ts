import { Router, Request, Response } from "express";
import { z } from "zod";
import { usersService } from "./users.service";
import { verifyAuth } from "../../middleware/auth";
import { requireAdmin, requireRootAdmin, requireOwnerOrAdmin } from "../../middleware/roleGuard";
import { validateBody, validateParams, uuidParam } from "../../middleware/validation";
import { success, paginated, error, serverError } from "../../utils/response";
import { ApiError } from "../../utils/errors";
import { UserRole } from "../../config/constants";

const router = Router();

// Validation schemas
const updateProfileSchema = z.object({
  full_name: z.string().min(1).max(255).optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional(),
});

const updateRoleSchema = z.object({
  role: z.enum(["root_admin", "admin", "brand_manager", "client"]),
  brand_id: z.string().uuid().optional(),
});

const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  full_name: z.string().min(1, "Full name is required").max(255),
  phone: z.string().optional(),
  role: z.enum(["root_admin", "admin", "brand_manager", "client"]),
  brand_id: z.string().uuid().optional(),
  branch_id: z.string().uuid().optional(),
});

const addressSchema = z.object({
  label: z.string().min(1).max(50),
  full_name: z.string().min(1).max(255),
  phone: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().optional(),
  postal_code: z.string().min(1),
  country: z.string().min(1),
  is_default: z.boolean().optional(),
});

/**
 * GET /users
 * Get all users (Admin only)
 */
router.get("/", verifyAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { users, total } = await usersService.getUsers(req.query as Record<string, unknown>);
    const page = parseInt(String(req.query.page || "1"), 10);
    const limit = parseInt(String(req.query.limit || "20"), 10);
    paginated(res, users, { page, limit, total });
  } catch (err) {
    console.error("Get users error:", err);
    serverError(res, "Failed to fetch users");
  }
});

/**
 * POST /users
 * Create a new user (Admin only)
 */
router.post(
  "/",
  verifyAuth,
  requireAdmin,
  validateBody(createUserSchema),
  async (req: Request, res: Response) => {
    try {
      const user = await usersService.createUser({
        email: req.body.email,
        password: req.body.password,
        full_name: req.body.full_name,
        phone: req.body.phone,
        role: req.body.role as UserRole,
        brand_id: req.body.brand_id,
        branch_id: req.body.branch_id,
      });
      success(res, user, "User created successfully");
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Create user error:", err);
      serverError(res, "Failed to create user");
    }
  }
);

/**
 * GET /users/me
 * Get current user profile
 */
router.get("/me", verifyAuth, async (req: Request, res: Response) => {
  try {
    const user = await usersService.getUserById(req.user!.userId);
    success(res, user);
  } catch (err) {
    if (err instanceof ApiError) {
      error(res, err.message, err.statusCode);
      return;
    }
    console.error("Get profile error:", err);
    serverError(res, "Failed to fetch profile");
  }
});

/**
 * GET /users/:id
 * Get user by ID
 */
router.get(
  "/:id",
  verifyAuth,
  requireOwnerOrAdmin((req) => req.params.id),
  validateParams(uuidParam),
  async (req: Request, res: Response) => {
    try {
      const user = await usersService.getUserById(req.params.id);
      success(res, user);
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Get user error:", err);
      serverError(res, "Failed to fetch user");
    }
  }
);

/**
 * PUT /users/me
 * Update current user profile
 */
router.put(
  "/me",
  verifyAuth,
  validateBody(updateProfileSchema),
  async (req: Request, res: Response) => {
    try {
      const user = await usersService.updateProfile(req.user!.userId, req.body);
      success(res, user, "Profile updated successfully");
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Update profile error:", err);
      serverError(res, "Failed to update profile");
    }
  }
);

/**
 * PUT /users/:id/role
 * Update user role (Root Admin only)
 */
router.put(
  "/:id/role",
  verifyAuth,
  requireRootAdmin,
  validateParams(uuidParam),
  validateBody(updateRoleSchema),
  async (req: Request, res: Response) => {
    try {
      const user = await usersService.updateRole(
        req.params.id,
        req.body.role as UserRole,
        req.body.brand_id
      );
      success(res, user, "User role updated successfully");
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Update role error:", err);
      serverError(res, "Failed to update user role");
    }
  }
);

/**
 * POST /users/me/addresses
 * Add address to current user
 */
router.post(
  "/me/addresses",
  verifyAuth,
  validateBody(addressSchema),
  async (req: Request, res: Response) => {
    try {
      const user = await usersService.addAddress(req.user!.userId, req.body);
      success(res, user, "Address added successfully");
    } catch (err) {
      console.error("Add address error:", err);
      serverError(res, "Failed to add address");
    }
  }
);

/**
 * PUT /users/me/addresses/:addressId
 * Update an address
 */
router.put(
  "/me/addresses/:addressId",
  verifyAuth,
  validateBody(addressSchema.partial()),
  async (req: Request, res: Response) => {
    try {
      const user = await usersService.updateAddress(
        req.user!.userId,
        req.params.addressId,
        req.body
      );
      success(res, user, "Address updated successfully");
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Update address error:", err);
      serverError(res, "Failed to update address");
    }
  }
);

/**
 * DELETE /users/me/addresses/:addressId
 * Delete an address
 */
router.delete(
  "/me/addresses/:addressId",
  verifyAuth,
  async (req: Request, res: Response) => {
    try {
      const user = await usersService.deleteAddress(req.user!.userId, req.params.addressId);
      success(res, user, "Address deleted successfully");
    } catch (err) {
      console.error("Delete address error:", err);
      serverError(res, "Failed to delete address");
    }
  }
);

export default router;

