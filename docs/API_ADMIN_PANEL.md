# LaBrand Admin Panel API Documentation

**Base URL:** `https://asia-south1-labrand-ef645.cloudfunctions.net/api`

**Roles:** `root_admin`, `admin`

---

## 🔐 Authentication

All admin endpoints require Firebase Authentication token in header:

```
Authorization: Bearer <firebase_id_token>
```

### Get Current User
```http
GET /users/me
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firebase_uid": "firebase_uid",
    "email": "admin@labrand.com",
    "role": "root_admin",
    "full_name": "Admin User",
    "avatar_url": null,
    "phone": "+998901234567",
    "is_active": true,
    "created_at": "2026-01-06T00:00:00Z"
  }
}
```

---

## 👥 Users Module

### List All Users
```http
GET /users
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `limit` | int | 20 | Items per page (max 100) |
| `role` | string | - | Filter by role: `client`, `brand_manager`, `admin`, `root_admin` |
| `search` | string | - | Search by name or email |
| `is_active` | boolean | - | Filter by active status |
| `sort` | string | `created_at` | Sort field |
| `order` | string | `desc` | Sort order: `asc`, `desc` |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "firebase_uid": "firebase_uid",
      "email": "user@example.com",
      "role": "client",
      "full_name": "John Doe",
      "avatar_url": "https://...",
      "phone": "+998901234567",
      "is_active": true,
      "created_at": "2026-01-06T00:00:00Z",
      "updated_at": "2026-01-06T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Required Role:** `admin`, `root_admin`

---

### Get User by ID
```http
GET /users/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firebase_uid": "firebase_uid",
    "email": "user@example.com",
    "role": "client",
    "full_name": "John Doe",
    "avatar_url": "https://...",
    "phone": "+998901234567",
    "is_active": true,
    "created_at": "2026-01-06T00:00:00Z",
    "addresses": [
      {
        "id": "uuid",
        "label": "Home",
        "full_address": "123 Main St",
        "city": "Tashkent",
        "district": "Chilanzar",
        "postal_code": "100000",
        "is_default": true
      }
    ],
    "orders_count": 5,
    "total_spent": 1500000
  }
}
```

**Required Role:** `admin`, `root_admin`

---

### Update User Role
```http
PATCH /users/:id/role
```

**Request Body:**
```json
{
  "role": "brand_manager",
  "brand_id": "uuid",      // Required if role is brand_manager
  "branch_id": "uuid"      // Optional, specific branch assignment
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "role": "brand_manager",
    "brand_id": "uuid",
    "branch_id": "uuid"
  }
}
```

**Required Role:** `root_admin` only

---

### Deactivate User
```http
PATCH /users/:id/deactivate
```

**Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

**Required Role:** `admin`, `root_admin`

---

### Delete User
```http
DELETE /users/:id
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Required Role:** `root_admin` only

---

## 🏢 Brands Module

### List All Brands
```http
GET /brands
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `limit` | int | 20 | Items per page |
| `search` | string | - | Search by name |
| `is_active` | boolean | - | Filter by status |
| `sort` | string | `name` | Sort field |
| `order` | string | `asc` | Sort order |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Nike",
      "slug": "nike",
      "logo_url": "https://...",
      "description": "Just Do It",
      "website": "https://nike.com",
      "is_active": true,
      "is_featured": true,
      "created_at": "2026-01-06T00:00:00Z",
      "branches_count": 5,
      "products_count": 150
    }
  ],
  "pagination": {...}
}
```

**Required Role:** `admin`, `root_admin`

---

### Create Brand
```http
POST /brands
```

**Request Body:**
```json
{
  "name": "Nike",
  "slug": "nike",              // Optional, auto-generated if not provided
  "logo_url": "https://...",
  "description": "Just Do It",
  "website": "https://nike.com",
  "is_featured": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nike",
    "slug": "nike",
    "logo_url": "https://...",
    "description": "Just Do It",
    "website": "https://nike.com",
    "is_active": true,
    "is_featured": false,
    "created_at": "2026-01-06T00:00:00Z"
  }
}
```

**Required Role:** `admin`, `root_admin`

---

### Get Brand Details
```http
GET /brands/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nike",
    "slug": "nike",
    "logo_url": "https://...",
    "description": "Just Do It",
    "website": "https://nike.com",
    "is_active": true,
    "is_featured": true,
    "created_at": "2026-01-06T00:00:00Z",
    "branches": [
      {
        "id": "uuid",
        "name": "Nike Tashkent City",
        "city": "Tashkent",
        "is_active": true
      }
    ],
    "managers": [
      {
        "id": "uuid",
        "full_name": "Manager Name",
        "email": "manager@nike.com",
        "branch_id": "uuid"
      }
    ],
    "statistics": {
      "total_products": 150,
      "active_products": 120,
      "total_orders": 500,
      "total_revenue": 50000000
    }
  }
}
```

**Required Role:** `admin`, `root_admin`

---

### Update Brand
```http
PUT /brands/:id
```

**Request Body:**
```json
{
  "name": "Nike Updated",
  "logo_url": "https://...",
  "description": "Updated description",
  "website": "https://nike.com",
  "is_featured": true
}
```

**Required Role:** `admin`, `root_admin`

---

### Toggle Brand Status
```http
PATCH /brands/:id/status
```

**Request Body:**
```json
{
  "is_active": false
}
```

**Required Role:** `admin`, `root_admin`

---

### Delete Brand
```http
DELETE /brands/:id
```

**Note:** Soft delete - sets `is_active` to false

**Required Role:** `root_admin` only

---

## 🏪 Branches Module

### List All Branches
```http
GET /brands/:brandId/branches
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "brand_id": "uuid",
      "name": "Nike Tashkent City",
      "city": "Tashkent",
      "district": "Yunusabad",
      "address": "Tashkent City Mall, Floor 2",
      "phone": "+998712345678",
      "working_hours": {
        "monday": {"open": "10:00", "close": "22:00"},
        "tuesday": {"open": "10:00", "close": "22:00"},
        "sunday": {"open": "11:00", "close": "20:00"}
      },
      "location": {
        "latitude": 41.311081,
        "longitude": 69.240562
      },
      "is_active": true,
      "created_at": "2026-01-06T00:00:00Z"
    }
  ]
}
```

**Required Role:** `admin`, `root_admin`

---

### Create Branch
```http
POST /brands/:brandId/branches
```

**Request Body:**
```json
{
  "name": "Nike Tashkent City",
  "city": "Tashkent",
  "district": "Yunusabad",
  "address": "Tashkent City Mall, Floor 2",
  "phone": "+998712345678",
  "working_hours": {
    "monday": {"open": "10:00", "close": "22:00"},
    "tuesday": {"open": "10:00", "close": "22:00"},
    "wednesday": {"open": "10:00", "close": "22:00"},
    "thursday": {"open": "10:00", "close": "22:00"},
    "friday": {"open": "10:00", "close": "22:00"},
    "saturday": {"open": "10:00", "close": "22:00"},
    "sunday": {"open": "11:00", "close": "20:00"}
  },
  "latitude": 41.311081,
  "longitude": 69.240562
}
```

**Required Role:** `admin`, `root_admin`

---

### Update Branch
```http
PUT /brands/:brandId/branches/:branchId
```

**Required Role:** `admin`, `root_admin`

---

### Delete Branch
```http
DELETE /brands/:brandId/branches/:branchId
```

**Required Role:** `root_admin` only

---

### Assign Manager to Branch
```http
POST /brands/:brandId/branches/:branchId/managers
```

**Request Body:**
```json
{
  "user_id": "uuid"
}
```

**Required Role:** `admin`, `root_admin`

---

## 📦 Categories Module (Admin)

### List All Categories (Flat)
```http
GET /categories/all
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "parent_id": null,
      "name": "Men",
      "slug": "men",
      "image_url": "https://...",
      "gender": "men",
      "position": 1,
      "is_active": true,
      "created_at": "2026-01-06T00:00:00Z",
      "products_count": 500
    }
  ]
}
```

**Required Role:** `admin`, `root_admin`

---

### Create Category
```http
POST /categories
```

**Request Body:**
```json
{
  "name": "New Category",
  "slug": "new-category",       // Optional
  "parent_id": "uuid",          // null for root category
  "image_url": "https://...",
  "gender": "men",              // men, women, kids, unisex
  "position": 1
}
```

**Required Role:** `admin`, `root_admin`

---

### Update Category
```http
PUT /categories/:id
```

**Request Body:**
```json
{
  "name": "Updated Category",
  "image_url": "https://...",
  "position": 2,
  "is_active": true
}
```

**Required Role:** `admin`, `root_admin`

---

### Reorder Categories
```http
PATCH /categories/reorder
```

**Request Body:**
```json
{
  "orders": [
    {"id": "uuid1", "position": 1},
    {"id": "uuid2", "position": 2},
    {"id": "uuid3", "position": 3}
  ]
}
```

**Required Role:** `admin`, `root_admin`

---

### Delete Category
```http
DELETE /categories/:id
```

**Note:** Only allowed if no products are assigned

**Required Role:** `root_admin` only

---

## 🛍️ Products Module (Admin)

### List All Products
```http
GET /products
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `limit` | int | 20 | Items per page |
| `brand_id` | uuid | - | Filter by brand |
| `category_id` | uuid | - | Filter by category |
| `status` | string | - | Filter: `draft`, `active`, `archived` |
| `is_featured` | boolean | - | Featured products only |
| `search` | string | - | Search in name, SKU |
| `min_price` | int | - | Minimum price |
| `max_price` | int | - | Maximum price |
| `sort` | string | `created_at` | Sort field |
| `order` | string | `desc` | Sort order |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "brand_id": "uuid",
      "branch_id": "uuid",
      "category_id": "uuid",
      "name": "Air Max 90",
      "slug": "air-max-90",
      "sku": "NIKE-AM90-001",
      "description": "Classic sneaker",
      "price": 150000,
      "compare_at_price": 180000,
      "cost_price": 80000,
      "status": "active",
      "is_featured": true,
      "stock_quantity": 50,
      "low_stock_threshold": 10,
      "images": ["https://..."],
      "created_at": "2026-01-06T00:00:00Z",
      "brand": {
        "id": "uuid",
        "name": "Nike"
      },
      "category": {
        "id": "uuid",
        "name": "Sneakers"
      }
    }
  ],
  "pagination": {...}
}
```

**Required Role:** `admin`, `root_admin`

---

### Get Product Details (Admin)
```http
GET /products/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "brand_id": "uuid",
    "branch_id": "uuid",
    "category_id": "uuid",
    "name": "Air Max 90",
    "slug": "air-max-90",
    "sku": "NIKE-AM90-001",
    "description": "Classic sneaker with visible Air unit",
    "short_description": "Iconic sneaker",
    "price": 150000,
    "compare_at_price": 180000,
    "cost_price": 80000,
    "status": "active",
    "is_featured": true,
    "stock_quantity": 50,
    "low_stock_threshold": 10,
    "images": [
      "https://storage.../main.jpg",
      "https://storage.../side.jpg"
    ],
    "created_at": "2026-01-06T00:00:00Z",
    "updated_at": "2026-01-06T00:00:00Z",
    "brand": {
      "id": "uuid",
      "name": "Nike",
      "logo_url": "https://..."
    },
    "branch": {
      "id": "uuid",
      "name": "Nike Tashkent City"
    },
    "category": {
      "id": "uuid",
      "name": "Sneakers",
      "path": ["Men", "Shoes", "Sneakers"]
    },
    "variants": [
      {
        "id": "uuid",
        "sku": "NIKE-AM90-001-42-BLK",
        "size": "42",
        "color": "Black",
        "color_hex": "#000000",
        "price_modifier": 0,
        "stock_quantity": 10,
        "is_active": true
      }
    ],
    "reviews_summary": {
      "average_rating": 4.5,
      "total_reviews": 25
    },
    "sales_statistics": {
      "total_sold": 100,
      "total_revenue": 15000000,
      "last_30_days_sold": 20
    }
  }
}
```

**Required Role:** `admin`, `root_admin`

---

### Bulk Update Products Status
```http
PATCH /products/bulk/status
```

**Request Body:**
```json
{
  "product_ids": ["uuid1", "uuid2", "uuid3"],
  "status": "archived"
}
```

**Required Role:** `admin`, `root_admin`

---

### Bulk Delete Products
```http
DELETE /products/bulk
```

**Request Body:**
```json
{
  "product_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Required Role:** `root_admin` only

---

## 📋 Orders Module (Admin)

### List All Orders
```http
GET /orders
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `limit` | int | 20 | Items per page |
| `status` | string | - | Filter by status |
| `brand_id` | uuid | - | Filter by brand |
| `user_id` | uuid | - | Filter by customer |
| `date_from` | date | - | Orders from date |
| `date_to` | date | - | Orders to date |
| `min_total` | int | - | Minimum total |
| `max_total` | int | - | Maximum total |
| `sort` | string | `created_at` | Sort field |
| `order` | string | `desc` | Sort order |

**Order Statuses:**
- `pending` - Awaiting confirmation
- `confirmed` - Order confirmed
- `processing` - Being prepared
- `shipped` - In transit
- `delivered` - Completed
- `cancelled` - Cancelled
- `refunded` - Refunded

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "order_number": "LB-2026-00001",
      "user_id": "uuid",
      "status": "pending",
      "subtotal": 300000,
      "discount_amount": 30000,
      "shipping_cost": 15000,
      "total": 285000,
      "payment_method": "cash_on_delivery",
      "payment_status": "pending",
      "created_at": "2026-01-06T00:00:00Z",
      "customer": {
        "id": "uuid",
        "full_name": "John Doe",
        "email": "john@example.com",
        "phone": "+998901234567"
      },
      "items_count": 3
    }
  ],
  "pagination": {...}
}
```

**Required Role:** `admin`, `root_admin`

---

### Get Order Details (Admin)
```http
GET /orders/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "order_number": "LB-2026-00001",
    "user_id": "uuid",
    "status": "pending",
    "subtotal": 300000,
    "discount_amount": 30000,
    "discount_code": "SAVE10",
    "shipping_cost": 15000,
    "total": 285000,
    "payment_method": "cash_on_delivery",
    "payment_status": "pending",
    "notes": "Please call before delivery",
    "created_at": "2026-01-06T00:00:00Z",
    "updated_at": "2026-01-06T00:00:00Z",
    "customer": {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "+998901234567"
    },
    "shipping_address": {
      "full_name": "John Doe",
      "phone": "+998901234567",
      "city": "Tashkent",
      "district": "Chilanzar",
      "address": "123 Main St, Apt 4",
      "postal_code": "100000"
    },
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "variant_id": "uuid",
        "product_name": "Air Max 90",
        "variant_name": "Size 42, Black",
        "sku": "NIKE-AM90-001-42-BLK",
        "price": 150000,
        "quantity": 2,
        "total": 300000,
        "image_url": "https://...",
        "brand": {
          "id": "uuid",
          "name": "Nike"
        }
      }
    ],
    "status_history": [
      {
        "status": "pending",
        "changed_at": "2026-01-06T10:00:00Z",
        "changed_by": null,
        "note": "Order placed"
      },
      {
        "status": "confirmed",
        "changed_at": "2026-01-06T10:30:00Z",
        "changed_by": "admin_user_id",
        "note": "Order confirmed by admin"
      }
    ]
  }
}
```

**Required Role:** `admin`, `root_admin`

---

### Update Order Status
```http
PATCH /orders/:id/status
```

**Request Body:**
```json
{
  "status": "confirmed",
  "note": "Order confirmed, preparing for shipment"
}
```

**Required Role:** `admin`, `root_admin`

---

### Cancel Order (Admin)
```http
POST /orders/:id/cancel
```

**Request Body:**
```json
{
  "reason": "Customer requested cancellation",
  "refund": true
}
```

**Required Role:** `admin`, `root_admin`

---

## ⭐ Reviews Module (Admin)

### List All Reviews
```http
GET /reviews
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `limit` | int | 20 | Items per page |
| `product_id` | uuid | - | Filter by product |
| `brand_id` | uuid | - | Filter by brand |
| `rating` | int | - | Filter by rating (1-5) |
| `is_approved` | boolean | - | Filter by approval |
| `has_images` | boolean | - | Filter reviews with images |
| `sort` | string | `created_at` | Sort field |
| `order` | string | `desc` | Sort order |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "user_id": "uuid",
      "rating": 5,
      "title": "Great product!",
      "comment": "Really satisfied with quality",
      "images": ["https://..."],
      "is_approved": true,
      "is_verified_purchase": true,
      "created_at": "2026-01-06T00:00:00Z",
      "user": {
        "id": "uuid",
        "full_name": "John D.",
        "avatar_url": "https://..."
      },
      "product": {
        "id": "uuid",
        "name": "Air Max 90",
        "image_url": "https://..."
      }
    }
  ],
  "pagination": {...}
}
```

**Required Role:** `admin`, `root_admin`

---

### Approve/Reject Review
```http
PATCH /reviews/:id/approve
```

**Request Body:**
```json
{
  "is_approved": true
}
```

**Required Role:** `admin`, `root_admin`

---

### Delete Review
```http
DELETE /reviews/:id
```

**Required Role:** `admin`, `root_admin`

---

## 📊 Analytics Module (Admin Only)

### Dashboard Overview
```http
GET /analytics/dashboard
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | string | `30d` | Period: `7d`, `30d`, `90d`, `1y` |

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_revenue": 150000000,
      "revenue_change": 12.5,
      "total_orders": 500,
      "orders_change": 8.3,
      "total_customers": 1200,
      "customers_change": 15.2,
      "average_order_value": 300000,
      "aov_change": 3.1
    },
    "revenue_chart": [
      {"date": "2026-01-01", "revenue": 5000000, "orders": 15},
      {"date": "2026-01-02", "revenue": 6000000, "orders": 18}
    ],
    "top_products": [
      {
        "id": "uuid",
        "name": "Air Max 90",
        "image_url": "https://...",
        "total_sold": 50,
        "revenue": 7500000
      }
    ],
    "top_brands": [
      {
        "id": "uuid",
        "name": "Nike",
        "logo_url": "https://...",
        "total_orders": 200,
        "revenue": 30000000
      }
    ],
    "orders_by_status": {
      "pending": 20,
      "confirmed": 15,
      "processing": 10,
      "shipped": 25,
      "delivered": 400,
      "cancelled": 30
    },
    "recent_orders": [...],
    "low_stock_products": [...]
  }
}
```

**Required Role:** `admin`, `root_admin`

---

### Sales Report
```http
GET /analytics/sales
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `date_from` | date | - | Start date |
| `date_to` | date | - | End date |
| `group_by` | string | `day` | Group: `day`, `week`, `month` |
| `brand_id` | uuid | - | Filter by brand |
| `category_id` | uuid | - | Filter by category |

**Required Role:** `admin`, `root_admin`

---

### Inventory Report
```http
GET /analytics/inventory
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_products": 500,
    "active_products": 450,
    "out_of_stock": 25,
    "low_stock": 50,
    "total_stock_value": 500000000,
    "by_category": [
      {
        "category": "Sneakers",
        "products": 100,
        "stock_value": 150000000
      }
    ],
    "by_brand": [
      {
        "brand": "Nike",
        "products": 150,
        "stock_value": 225000000
      }
    ]
  }
}
```

**Required Role:** `admin`, `root_admin`

---

## 🎫 Promo Codes Module

### List Promo Codes
```http
GET /promo-codes
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "SAVE10",
      "type": "percentage",
      "value": 10,
      "min_order_amount": 100000,
      "max_discount": 50000,
      "usage_limit": 100,
      "used_count": 45,
      "valid_from": "2026-01-01T00:00:00Z",
      "valid_to": "2026-12-31T23:59:59Z",
      "is_active": true
    }
  ]
}
```

**Required Role:** `admin`, `root_admin`

---

### Create Promo Code
```http
POST /promo-codes
```

**Request Body:**
```json
{
  "code": "SUMMER20",
  "type": "percentage",           // percentage, fixed
  "value": 20,
  "min_order_amount": 200000,
  "max_discount": 100000,         // For percentage type
  "usage_limit": 500,
  "per_user_limit": 1,
  "valid_from": "2026-06-01T00:00:00Z",
  "valid_to": "2026-08-31T23:59:59Z",
  "applicable_brands": ["uuid1", "uuid2"],    // Empty = all brands
  "applicable_categories": ["uuid1"],          // Empty = all categories
  "is_active": true
}
```

**Required Role:** `admin`, `root_admin`

---

### Deactivate Promo Code
```http
PATCH /promo-codes/:id/deactivate
```

**Required Role:** `admin`, `root_admin`

---

## 🔔 Notifications Module

### Send Push Notification
```http
POST /notifications/push
```

**Request Body:**
```json
{
  "title": "Flash Sale! 50% Off",
  "body": "Limited time offer on all Nike products",
  "target": "all",                    // all, segment, user
  "user_ids": ["uuid1", "uuid2"],     // For target: user
  "segment": "active_buyers",          // For target: segment
  "data": {
    "type": "promotion",
    "link": "/sale/nike"
  },
  "schedule_at": null                  // null for immediate
}
```

**Required Role:** `admin`, `root_admin`

---

## ⚙️ Settings Module (Root Admin Only)

### Get App Settings
```http
GET /settings
```

**Response:**
```json
{
  "success": true,
  "data": {
    "general": {
      "app_name": "LaBrand",
      "support_email": "support@labrand.com",
      "support_phone": "+998712345678"
    },
    "shipping": {
      "free_shipping_threshold": 500000,
      "default_shipping_cost": 15000
    },
    "payments": {
      "enabled_methods": ["cash_on_delivery", "card", "payme", "click"]
    }
  }
}
```

**Required Role:** `root_admin` only

---

### Update Settings
```http
PUT /settings
```

**Required Role:** `root_admin` only

---

## 📁 File Upload

### Upload Image
```http
POST /upload/image
Content-Type: multipart/form-data
```

**Form Data:**
- `file` - Image file (max 5MB)
- `folder` - Destination: `products`, `brands`, `categories`, `users`

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://storage.googleapis.com/labrand/products/image.jpg",
    "thumbnail_url": "https://storage.../products/image_thumb.jpg"
  }
}
```

**Required Role:** `admin`, `root_admin`

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

**Common Error Codes:**
- `UNAUTHORIZED` - Invalid or missing token (401)
- `FORBIDDEN` - Insufficient permissions (403)
- `NOT_FOUND` - Resource not found (404)
- `VALIDATION_ERROR` - Invalid request data (400)
- `CONFLICT` - Resource already exists (409)
- `SERVER_ERROR` - Internal server error (500)

