import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../config/constants";

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Parse pagination parameters from query
 */
export function parsePagination(query: Record<string, unknown>): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(String(query.page || "1"), 10));
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(String(query.limit || DEFAULT_PAGE_SIZE), 10))
  );
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * Parse sort parameters from query
 */
export function parseSort(
  query: Record<string, unknown>,
  allowedFields: string[],
  defaultField: string = "created_at",
  defaultOrder: "asc" | "desc" = "desc"
): { field: string; order: "asc" | "desc" } {
  const field = allowedFields.includes(String(query.sort_by))
    ? String(query.sort_by)
    : defaultField;
  const order = query.sort_order === "asc" ? "asc" : defaultOrder;
  return { field, order };
}

/**
 * Remove undefined values from an object
 */
export function removeUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  ) as Partial<T>;
}

/**
 * Calculate discount
 */
export function calculateDiscount(
  subtotal: number,
  discountType: "percentage" | "fixed",
  discountValue: number,
  maxDiscount?: number | null
): number {
  let discount = 0;
  if (discountType === "percentage") {
    discount = (subtotal * discountValue) / 100;
  } else {
    discount = discountValue;
  }
  if (maxDiscount && discount > maxDiscount) {
    discount = maxDiscount;
  }
  return Math.min(discount, subtotal);
}

/**
 * Format price (2 decimal places)
 */
export function formatPrice(price: number): number {
  return Math.round(price * 100) / 100;
}

