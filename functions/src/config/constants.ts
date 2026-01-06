// User Roles
export enum UserRole {
  ROOT_ADMIN = "root_admin",
  ADMIN = "admin",
  BRAND_MANAGER = "brand_manager",
  CLIENT = "client",
}

// Order Status
export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

// Gender Types
export enum GenderType {
  MEN = "men",
  WOMEN = "women",
  KIDS = "kids",
  UNISEX = "unisex",
}

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// API Response codes
export const ResponseCodes = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
} as const;

