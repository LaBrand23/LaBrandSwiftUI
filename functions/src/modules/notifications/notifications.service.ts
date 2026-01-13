import supabase from "../../config/supabase";
import { db } from "../../config/firebase";
import { NotFoundError } from "../../utils/errors";
import { parsePagination } from "../../utils/helpers";

export type NotificationType = "new_order" | "new_review" | "low_stock" | "order_status";

export interface Notification {
  id: string;
  user_id: string | null;
  brand_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export interface CreateNotificationData {
  user_id?: string;
  brand_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

class NotificationsService {
  /**
   * Create a new notification
   */
  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        user_id: data.user_id || null,
        brand_id: data.brand_id,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || null,
        is_read: false,
      })
      .select()
      .single();

    if (error) throw error;

    // Also write to Firestore for real-time updates
    try {
      await db.collection("notifications").doc(notification.id).set({
        brand_id: notification.brand_id,
        type: notification.type,
        title: notification.title,
        is_read: false,
        created_at: notification.created_at,
      });
    } catch (firestoreError) {
      console.error("Firestore notification sync error:", firestoreError);
    }

    return notification;
  }

  /**
   * Create notification for brand (sends to all brand managers of a brand)
   */
  async createBrandNotification(
    brandId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>
  ): Promise<Notification> {
    return this.createNotification({
      brand_id: brandId,
      type,
      title,
      message,
      data,
    });
  }

  /**
   * Get notifications for a brand
   */
  async getNotifications(
    brandId: string,
    query: Record<string, unknown>
  ): Promise<{ notifications: Notification[]; total: number }> {
    const { limit, offset } = parsePagination(query);
    const type = query.type as NotificationType | undefined;
    const isRead = query.is_read as string | undefined;

    let dbQuery = supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("brand_id", brandId)
      .order("created_at", { ascending: false });

    if (type) {
      dbQuery = dbQuery.eq("type", type);
    }

    if (isRead !== undefined) {
      dbQuery = dbQuery.eq("is_read", isRead === "true");
    }

    const { data, error, count } = await dbQuery.range(offset, offset + limit - 1);

    // If table doesn't exist or other error, return empty results
    if (error) {
      console.error("Get notifications error:", error);
      // Return empty if table doesn't exist
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        return { notifications: [], total: 0 };
      }
      throw error;
    }

    return {
      notifications: data || [],
      total: count || 0,
    };
  }

  /**
   * Get unread notification count for a brand
   */
  async getUnreadCount(brandId: string): Promise<number> {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("brand_id", brandId)
      .eq("is_read", false);

    // If table doesn't exist, return 0
    if (error) {
      console.error("Get unread count error:", error);
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        return 0;
      }
      throw error;
    }

    return count || 0;
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string, brandId: string): Promise<Notification> {
    const { data: notification, error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("brand_id", brandId)
      .select()
      .single();

    if (error) throw error;
    if (!notification) throw new NotFoundError("Notification not found");

    // Update Firestore
    try {
      await db.collection("notifications").doc(id).update({
        is_read: true,
      });
    } catch (firestoreError) {
      console.error("Firestore notification update error:", firestoreError);
    }

    return notification;
  }

  /**
   * Mark all notifications as read for a brand
   */
  async markAllAsRead(brandId: string): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("brand_id", brandId)
      .eq("is_read", false);

    if (error) throw error;

    // Update all in Firestore
    try {
      const snapshot = await db
        .collection("notifications")
        .where("brand_id", "==", brandId)
        .where("is_read", "==", false)
        .get();

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { is_read: true });
      });
      await batch.commit();
    } catch (firestoreError) {
      console.error("Firestore batch update error:", firestoreError);
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string, brandId: string): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id)
      .eq("brand_id", brandId);

    if (error) throw error;

    // Delete from Firestore
    try {
      await db.collection("notifications").doc(id).delete();
    } catch (firestoreError) {
      console.error("Firestore notification delete error:", firestoreError);
    }
  }

  /**
   * Get a single notification by ID
   */
  async getNotificationById(id: string, brandId: string): Promise<Notification> {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("id", id)
      .eq("brand_id", brandId)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundError("Notification not found");

    return data;
  }
}

export const notificationsService = new NotificationsService();
