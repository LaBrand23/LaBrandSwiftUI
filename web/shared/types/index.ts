// User types
export type UserRole = 'client' | 'brand_manager' | 'admin' | 'root_admin';

export interface User {
  id: string;
  firebase_uid: string;
  email: string;
  role: UserRole;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  is_active: boolean;
  brand_id?: string;
  branch_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface AuthUser extends User {
  brand_assignment?: {
    brand_id: string;
    brand_name: string;
    brand_logo?: string;
    branch_id?: string;
    branch_name?: string;
    permissions: string[];
  };
}

// Brand types
export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  website?: string;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at?: string;
  branches_count?: number;
  products_count?: number;
}

export interface BrandDetails extends Brand {
  branches: Branch[];
  managers: BrandManager[];
  statistics: {
    total_products: number;
    active_products: number;
    total_orders: number;
    total_revenue: number;
  };
}

export interface BrandManager {
  id: string;
  full_name: string;
  email: string;
  branch_id?: string;
}

// Branch types
export interface Branch {
  id: string;
  brand_id: string;
  name: string;
  city: string;
  district?: string;
  address: string;
  phone?: string;
  working_hours?: WorkingHours;
  location?: {
    latitude: number;
    longitude: number;
  };
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface WorkingHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
}

// Category types
export type Gender = 'men' | 'women' | 'kids' | 'unisex';

export interface Category {
  id: string;
  parent_id?: string;
  name: string;
  slug: string;
  image_url?: string;
  gender?: Gender;
  position: number;
  is_active: boolean;
  created_at: string;
  products_count?: number;
  children?: Category[];
}

// Product types
export type ProductStatus = 'draft' | 'active' | 'archived';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface Product {
  id: string;
  brand_id: string;
  branch_id: string;
  category_id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_at_price?: number;
  cost_price?: number;
  status: ProductStatus;
  is_featured: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
  images: string[] | ProductImage[];
  weight?: number;
  dimensions?: ProductDimensions;
  tags?: string[];
  created_at: string;
  updated_at?: string;
  brand?: {
    id: string;
    name: string;
    logo_url?: string;
  };
  branch?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
    path?: string[];
  };
}

export interface ProductImage {
  url: string;
  thumbnail_url?: string;
  is_primary: boolean;
  position: number;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  size?: string;
  color?: string;
  color_hex?: string;
  price_modifier: number;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
}

export interface ProductDetails extends Product {
  variants: ProductVariant[];
  reviews_summary?: {
    average_rating: number;
    total_reviews: number;
  };
  sales_statistics?: {
    total_sold: number;
    total_revenue: number;
    last_30_days_sold: number;
  };
}

// Order types
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod = 'cash_on_delivery' | 'card' | 'payme' | 'click';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  discount_code?: string;
  shipping_cost: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  notes?: string;
  created_at: string;
  updated_at?: string;
  customer: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
  items_count?: number;
}

export interface OrderItem {
  id: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  variant_name?: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
  image_url?: string;
  brand?: {
    id: string;
    name: string;
  };
  branch_id?: string;
  branch_name?: string;
  status?: OrderStatus;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  city: string;
  district?: string;
  address: string;
  postal_code?: string;
}

export interface OrderDetails extends Order {
  shipping_address: ShippingAddress;
  items: OrderItem[];
  status_history: StatusHistoryItem[];
}

export interface StatusHistoryItem {
  status: OrderStatus;
  changed_at: string;
  changed_by?: string;
  note?: string;
}

// Review types
export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  is_approved: boolean;
  is_verified_purchase: boolean;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  product?: {
    id: string;
    name: string;
    image_url?: string;
  };
  response?: {
    text: string;
    responded_at: string;
    responded_by: string;
  };
}

// Promo Code types
export type PromoCodeType = 'percentage' | 'fixed';

export interface PromoCode {
  id: string;
  code: string;
  type: PromoCodeType;
  value: number;
  min_order_amount?: number;
  max_discount?: number;
  usage_limit?: number;
  per_user_limit?: number;
  used_count: number;
  valid_from: string;
  valid_to: string;
  applicable_brands?: string[];
  applicable_categories?: string[];
  is_active: boolean;
  created_at: string;
}

// Analytics types
export interface DashboardOverview {
  total_revenue: number;
  revenue_change: number;
  total_orders: number;
  orders_change: number;
  total_customers?: number;
  customers_change?: number;
  average_order_value: number;
  aov_change: number;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  name: string;
  image_url?: string;
  total_sold: number;
  revenue: number;
}

export interface TopBrand {
  id: string;
  name: string;
  logo_url?: string;
  total_orders: number;
  revenue: number;
}

export interface OrdersByStatus {
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  refunded?: number;
}

export interface DashboardData {
  overview: DashboardOverview;
  revenue_chart: ChartDataPoint[];
  top_products: TopProduct[];
  top_brands?: TopBrand[];
  orders_by_status: OrdersByStatus;
  recent_orders?: Order[];
  low_stock_products?: Product[];
  inventory_alerts?: {
    out_of_stock: number;
    low_stock: number;
  };
}

// Inventory types
export interface InventorySummary {
  total_products: number;
  total_variants: number;
  total_stock: number;
  total_value: number;
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
}

export interface InventoryAlert {
  type: 'out_of_stock' | 'low_stock';
  product_id: string;
  product_name: string;
  variant?: string;
  sku: string;
  current_stock?: number;
  threshold?: number;
}

export interface StockHistoryItem {
  id: string;
  variant_id: string;
  product_name: string;
  variant_name: string;
  previous_quantity: number;
  new_quantity: number;
  change: number;
  operation: 'set' | 'add' | 'subtract';
  reason?: string;
  changed_by: string;
  created_at: string;
}

// Settings types
export interface AppSettings {
  general: {
    app_name: string;
    support_email: string;
    support_phone: string;
  };
  shipping: {
    free_shipping_threshold: number;
    default_shipping_cost: number;
  };
  payments: {
    enabled_methods: PaymentMethod[];
  };
}

// Pagination types
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: Pagination;
}

export interface ApiError {
  success: false;
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

// Query params
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface UsersQueryParams extends PaginationParams {
  role?: UserRole;
  search?: string;
  is_active?: boolean;
}

export interface BrandsQueryParams extends PaginationParams {
  search?: string;
  is_active?: boolean;
}

export interface ProductsQueryParams extends PaginationParams {
  brand_id?: string;
  branch_id?: string;
  category_id?: string;
  status?: ProductStatus;
  stock?: StockStatus;
  is_featured?: boolean;
  search?: string;
  min_price?: number;
  max_price?: number;
}

export interface OrdersQueryParams extends PaginationParams {
  status?: OrderStatus;
  brand_id?: string;
  user_id?: string;
  branch_id?: string;
  date_from?: string;
  date_to?: string;
  min_total?: number;
  max_total?: number;
}

export interface ReviewsQueryParams extends PaginationParams {
  product_id?: string;
  brand_id?: string;
  rating?: number;
  is_approved?: boolean;
  has_images?: boolean;
  responded?: boolean;
}
