import { Request, Response, NextFunction } from "express";
import { UserRole } from "../config/constants";
import { forbidden, unauthorized } from "../utils/response";

/**
 * Role hierarchy - higher roles have all permissions of lower roles
 */
const roleHierarchy: Record<UserRole, number> = {
  [UserRole.ROOT_ADMIN]: 4,
  [UserRole.ADMIN]: 3,
  [UserRole.BRAND_MANAGER]: 2,
  [UserRole.CLIENT]: 1,
};

/**
 * Check if user has at least the required role
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      unauthorized(res, "Authentication required");
      return;
    }

    const userRoleLevel = roleHierarchy[req.user.role];
    const hasPermission = allowedRoles.some(
      (role) => userRoleLevel >= roleHierarchy[role]
    );

    if (!hasPermission) {
      forbidden(res, "Insufficient permissions");
      return;
    }

    next();
  };
}

/**
 * Require exact role (no hierarchy)
 */
export function requireExactRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      unauthorized(res, "Authentication required");
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      forbidden(res, "Insufficient permissions");
      return;
    }

    next();
  };
}

/**
 * Require admin or higher
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * Require root admin only
 */
export const requireRootAdmin = requireExactRole(UserRole.ROOT_ADMIN);

/**
 * Require brand manager or higher
 */
export const requireBrandManager = requireRole(UserRole.BRAND_MANAGER);

/**
 * Check if user can access brand-specific resource
 */
export function requireBrandAccess(getBrandId: (req: Request) => string | null) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      unauthorized(res, "Authentication required");
      return;
    }

    // Admins can access all brands
    if (req.user.role === UserRole.ROOT_ADMIN || req.user.role === UserRole.ADMIN) {
      next();
      return;
    }

    // Brand managers can only access their brand
    if (req.user.role === UserRole.BRAND_MANAGER) {
      const brandId = getBrandId(req);
      if (!brandId || brandId !== req.user.brandId) {
        forbidden(res, "You can only access your own brand's resources");
        return;
      }
    }

    next();
  };
}

/**
 * Check if user owns the resource or is admin
 */
export function requireOwnerOrAdmin(getUserId: (req: Request) => string | null) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      unauthorized(res, "Authentication required");
      return;
    }

    // Admins can access all resources
    if (req.user.role === UserRole.ROOT_ADMIN || req.user.role === UserRole.ADMIN) {
      next();
      return;
    }

    // Check ownership
    const resourceUserId = getUserId(req);
    if (resourceUserId !== req.user.userId) {
      forbidden(res, "You can only access your own resources");
      return;
    }

    next();
  };
}

