import { Router, Request, Response } from "express";
import { verifyAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/roleGuard";
import { UserRole } from "../../config/constants";
import { success, error } from "../../utils/response";
import { getDashboardData, getBrandDashboardData } from "./analytics.service";

const router = Router();

// All analytics routes require authentication
router.use(verifyAuth);

/**
 * GET /analytics/dashboard
 * Get dashboard analytics data (Admin only)
 */
router.get(
  "/dashboard",
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const period = (req.query.period as string) || "30d";
      const data = await getDashboardData(period);
      success(res, data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      error(res, "Failed to fetch dashboard data", 500);
    }
  }
);

/**
 * GET /analytics/brand-dashboard
 * Get brand-specific dashboard data (Brand Manager only)
 */
router.get(
  "/brand-dashboard",
  requireRole(UserRole.BRAND_MANAGER),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user;
      if (!user?.brandId) {
        error(res, "Brand ID not found for user", 400);
        return;
      }

      const period = (req.query.period as string) || "30d";
      const data = await getBrandDashboardData(user.brandId, period);
      success(res, data);
    } catch (err) {
      console.error("Error fetching brand dashboard data:", err);
      error(res, "Failed to fetch brand dashboard data", 500);
    }
  }
);

export default router;
