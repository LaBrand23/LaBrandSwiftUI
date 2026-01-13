import { Router, Request, Response } from "express";
import { notificationsService } from "./notifications.service";
import { verifyAuth } from "../../middleware/auth";
import { requireBrandManager } from "../../middleware/roleGuard";
import { validateParams, uuidParam } from "../../middleware/validation";
import { success, paginated, error, serverError } from "../../utils/response";
import { ApiError } from "../../utils/errors";

const router = Router();

/**
 * GET /notifications
 * Get all notifications for the brand manager's brand
 */
router.get(
  "/",
  verifyAuth,
  requireBrandManager,
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.brandId) {
        error(res, "Brand ID not found for user", 400);
        return;
      }

      const { notifications, total } = await notificationsService.getNotifications(
        user.brandId,
        req.query as Record<string, unknown>
      );

      const page = parseInt(String(req.query.page || "1"), 10);
      const limit = parseInt(String(req.query.limit || "20"), 10);

      paginated(res, notifications, { page, limit, total });
    } catch (err) {
      console.error("Get notifications error:", err);
      serverError(res, "Failed to fetch notifications");
    }
  }
);

/**
 * GET /notifications/unread-count
 * Get unread notification count
 */
router.get(
  "/unread-count",
  verifyAuth,
  requireBrandManager,
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.brandId) {
        error(res, "Brand ID not found for user", 400);
        return;
      }

      const count = await notificationsService.getUnreadCount(user.brandId);
      success(res, { count });
    } catch (err) {
      console.error("Get unread count error:", err);
      serverError(res, "Failed to fetch unread count");
    }
  }
);

/**
 * GET /notifications/:id
 * Get a single notification
 */
router.get(
  "/:id",
  verifyAuth,
  requireBrandManager,
  validateParams(uuidParam),
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.brandId) {
        error(res, "Brand ID not found for user", 400);
        return;
      }

      const notification = await notificationsService.getNotificationById(
        req.params.id,
        user.brandId
      );
      success(res, notification);
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Get notification error:", err);
      serverError(res, "Failed to fetch notification");
    }
  }
);

/**
 * PATCH /notifications/:id/read
 * Mark a notification as read
 */
router.patch(
  "/:id/read",
  verifyAuth,
  requireBrandManager,
  validateParams(uuidParam),
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.brandId) {
        error(res, "Brand ID not found for user", 400);
        return;
      }

      const notification = await notificationsService.markAsRead(
        req.params.id,
        user.brandId
      );
      success(res, notification, "Notification marked as read");
    } catch (err) {
      if (err instanceof ApiError) {
        error(res, err.message, err.statusCode);
        return;
      }
      console.error("Mark as read error:", err);
      serverError(res, "Failed to mark notification as read");
    }
  }
);

/**
 * PATCH /notifications/read-all
 * Mark all notifications as read
 */
router.patch(
  "/read-all",
  verifyAuth,
  requireBrandManager,
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.brandId) {
        error(res, "Brand ID not found for user", 400);
        return;
      }

      await notificationsService.markAllAsRead(user.brandId);
      success(res, null, "All notifications marked as read");
    } catch (err) {
      console.error("Mark all as read error:", err);
      serverError(res, "Failed to mark all notifications as read");
    }
  }
);

/**
 * DELETE /notifications/:id
 * Delete a notification
 */
router.delete(
  "/:id",
  verifyAuth,
  requireBrandManager,
  validateParams(uuidParam),
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.brandId) {
        error(res, "Brand ID not found for user", 400);
        return;
      }

      await notificationsService.deleteNotification(req.params.id, user.brandId);
      success(res, null, "Notification deleted successfully");
    } catch (err) {
      console.error("Delete notification error:", err);
      serverError(res, "Failed to delete notification");
    }
  }
);

export default router;
