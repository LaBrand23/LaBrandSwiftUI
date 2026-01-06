import { UserRole, OrderStatus, GenderType } from "../config/constants";

// Base types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

// User types
export interface User extends BaseEntity {
  firebase_uid: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  brand_id: string | null;
  addresses: Address[];
  is_active: boolean;
}

export interface Address {
  id?: string;
  label: string;
  full_name: string;
  phone: string;
  street: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
}

// Brand types
export interface Brand extends BaseEntity {
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  is_active: boolean;
}

export interface Branch extends BaseEntity {
  brand_id: string;
  name: string;
  address: string;
  city: string | null;
  location: { lat: number; lng: number } | null;
  phone: string | null;
  working_hours: Record<string, string> | null;
  is_active: boolean;
}

// Category types
export interface Category extends BaseEntity {
  parent_id: string | null;
  name: string;
  slug: string;
  image_url: string | null;
  gender: GenderType | null;
  position: number;
  is_active: boolean;
  children?: Category[];
}

// Product types
export interface Product extends BaseEntity {
  brand_id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  is_new: boolean;
  is_featured: boolean;
  is_on_sale: boolean;
  stock_quantity: number;
  rating_average: number;
  rating_count: number;
  is_active: boolean;
  // Relations
  brand?: Brand;
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  color_hex: string | null;
  stock: number;
  sku: string | null;
  price_adjustment: number;
  is_active: boolean;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  position: number;
  is_primary: boolean;
  created_at: string;
}

// Order types
export interface Order extends BaseEntity {
  user_id: string;
  brand_id: string | null;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total: number;
  shipping_address: Address;
  billing_address: Address | null;
  promo_code: string | null;
  notes: string | null;
  estimated_delivery: string | null;
  delivered_at: string | null;
  // Relations
  items?: OrderItem[];
  user?: User;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_info: { size?: string; color?: string } | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  // Relations
  product?: Product;
}

// Review types
export interface Review extends BaseEntity {
  user_id: string;
  product_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  images: string[];
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  // Relations
  user?: Pick<User, "id" | "full_name" | "avatar_url">;
}

// Favorite types
export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

// Promo code types
export interface PromoCode extends BaseEntity {
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  brand_id: string | null;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Auth types
export interface AuthUser {
  uid: string;
  email: string | null;
  role: UserRole;
  brandId: string | null;
  userId: string;
}

// Cart types (Firestore)
export interface CartItem {
  productId: string;
  variantId: string | null;
  quantity: number;
  addedAt: string;
}

