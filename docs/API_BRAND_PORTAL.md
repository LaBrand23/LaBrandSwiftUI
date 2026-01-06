# LaBrand Brand Portal API Documentation

**Base URL:** `https://asia-south1-labrand-ef645.cloudfunctions.net/api`

**Role:** `brand_manager`

**Scope:** Brand managers can only access resources belonging to their assigned brand (and optionally specific branch).

---

## 🔐 Authentication

All endpoints require Firebase Authentication token:

```
Authorization: Bearer <firebase_id_token>
```

### Login Flow

1. User authenticates with Firebase Auth (email/password or social)
2. Backend verifies role is `brand_manager`
3. Returns user profile with brand/branch assignment

---

## 👤 Profile Module

### Get My Profile
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
    "email": "manager@nike.com",
    "role": "brand_manager",
    "full_name": "Brand Manager",
    "avatar_url": "https://...",
    "phone": "+998901234567",
    "is_active": true,
    "created_at": "2026-01-06T00:00:00Z",
    "brand_assignment": {
      "brand_id": "uuid",
      "brand_name": "Nike",
      "brand_logo": "https://...",
      "branch_id": "uuid",          // null if manages all branches
      "branch_name": "Nike Tashkent City",
      "permissions": [
        "products.create",
        "products.update",
        "products.delete",
        "orders.view",
        "orders.update_status",
        "inventory.manage",
        "reports.view"
      ]
    }
  }
}
```

---

### Update My Profile
```http
PUT /users/me
```

**Request Body:**
```json
{
  "full_name": "Updated Name",
  "phone": "+998901234567",
  "avatar_url": "https://..."
}
```

**Note:** Cannot change email or role

---

### Change Password
```http
POST /users/me/change-password
```

**Request Body:**
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword123"
}
```

---

## 🏢 My Brand Module

### Get My Brand Info
```http
GET /brand/me
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
    "statistics": {
      "total_products": 150,
      "active_products": 120,
      "out_of_stock": 10,
      "total_orders": 500,
      "pending_orders": 25,
      "total_revenue": 50000000
    }
  }
}
```

---

### Update Brand Info
```http
PUT /brand/me
```

**Request Body:**
```json
{
  "description": "Updated description",
  "website": "https://nike.com",
  "logo_url": "https://..."
}
```

**Note:** Cannot change brand name or slug

---

## 🏪 Branches Module

### List My Branches
```http
GET /brand/me/branches
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
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
      "is_my_branch": true,         // true if manager is assigned to this branch
      "statistics": {
        "products": 50,
        "orders_today": 5,
        "pending_orders": 3
      }
    }
  ]
}
```

**Note:** Returns all branches if manager has brand-level access, or only assigned branch otherwise

---

### Get Branch Details
```http
GET /brand/me/branches/:branchId
```

**Access:** Only accessible if manager is assigned to this branch or has brand-level access

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nike Tashkent City",
    "city": "Tashkent",
    "district": "Yunusabad",
    "address": "Tashkent City Mall, Floor 2",
    "phone": "+998712345678",
    "working_hours": {...},
    "location": {...},
    "is_active": true,
    "managers": [
      {
        "id": "uuid",
        "full_name": "Manager Name",
        "email": "manager@nike.com",
        "is_me": true
      }
    ],
    "products_count": 50,
    "orders": {
      "today": 5,
      "pending": 3,
      "processing": 2
    }
  }
}
```

---

### Update Branch Info
```http
PUT /brand/me/branches/:branchId
```

**Request Body:**
```json
{
  "phone": "+998712345678",
  "working_hours": {
    "monday": {"open": "09:00", "close": "21:00"},
    "tuesday": {"open": "09:00", "close": "21:00"}
  },
  "address": "Updated address"
}
```

**Note:** Cannot change branch name, city, or deactivate branch

---

## 📦 Products Module

### List My Products
```http
GET /brand/me/products
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `limit` | int | 20 | Items per page (max 100) |
| `branch_id` | uuid | - | Filter by branch |
| `category_id` | uuid | - | Filter by category |
| `status` | string | - | Filter: `draft`, `active`, `archived` |
| `stock` | string | - | Filter: `in_stock`, `low_stock`, `out_of_stock` |
| `search` | string | - | Search in name, SKU |
| `sort` | string | `created_at` | Sort field |
| `order` | string | `desc` | Sort order |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "branch_id": "uuid",
      "branch_name": "Nike Tashkent City",
      "category_id": "uuid",
      "category_name": "Sneakers",
      "name": "Air Max 90",
      "slug": "air-max-90",
      "sku": "NIKE-AM90-001",
      "price": 150000,
      "compare_at_price": 180000,
      "status": "active",
      "stock_quantity": 50,
      "low_stock_threshold": 10,
      "stock_status": "in_stock",
      "images": ["https://..."],
      "is_featured": true,
      "created_at": "2026-01-06T00:00:00Z",
      "variants_count": 5
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

---

### Get Product Details
```http
GET /brand/me/products/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "branch_id": "uuid",
    "branch_name": "Nike Tashkent City",
    "category_id": "uuid",
    "name": "Air Max 90",
    "slug": "air-max-90",
    "sku": "NIKE-AM90-001",
    "description": "Classic sneaker with visible Air unit for cushioning",
    "short_description": "Iconic Air Max sneaker",
    "price": 150000,
    "compare_at_price": 180000,
    "cost_price": 80000,
    "status": "active",
    "is_featured": true,
    "stock_quantity": 50,
    "low_stock_threshold": 10,
    "weight": 350,
    "dimensions": {
      "length": 30,
      "width": 12,
      "height": 10
    },
    "images": [
      {
        "url": "https://storage.../main.jpg",
        "is_primary": true,
        "position": 1
      },
      {
        "url": "https://storage.../side.jpg",
        "is_primary": false,
        "position": 2
      }
    ],
    "variants": [
      {
        "id": "uuid",
        "sku": "NIKE-AM90-001-40-BLK",
        "size": "40",
        "color": "Black",
        "color_hex": "#000000",
        "price_modifier": 0,
        "stock_quantity": 10,
        "is_active": true
      },
      {
        "id": "uuid",
        "sku": "NIKE-AM90-001-42-BLK",
        "size": "42",
        "color": "Black",
        "color_hex": "#000000",
        "price_modifier": 0,
        "stock_quantity": 15,
        "is_active": true
      },
      {
        "id": "uuid",
        "sku": "NIKE-AM90-001-42-WHT",
        "size": "42",
        "color": "White",
        "color_hex": "#FFFFFF",
        "price_modifier": 10000,
        "stock_quantity": 8,
        "is_active": true
      }
    ],
    "category": {
      "id": "uuid",
      "name": "Sneakers",
      "path": ["Men", "Shoes", "Sneakers"]
    },
    "tags": ["new-arrival", "bestseller"],
    "created_at": "2026-01-06T00:00:00Z",
    "updated_at": "2026-01-06T00:00:00Z",
    "statistics": {
      "views": 1500,
      "favorites": 120,
      "orders": 45,
      "reviews": 25,
      "average_rating": 4.5
    }
  }
}
```

---

### Create Product
```http
POST /brand/me/products
```

**Request Body:**
```json
{
  "branch_id": "uuid",                    // Required
  "category_id": "uuid",                  // Required
  "name": "Air Max 90",                   // Required
  "sku": "NIKE-AM90-001",                 // Required, unique
  "description": "Classic sneaker...",
  "short_description": "Iconic sneaker",
  "price": 150000,                        // Required
  "compare_at_price": 180000,             // Original price (for sale display)
  "cost_price": 80000,                    // Internal cost
  "status": "draft",                      // draft, active
  "is_featured": false,
  "stock_quantity": 50,                   // Required
  "low_stock_threshold": 10,
  "weight": 350,
  "dimensions": {
    "length": 30,
    "width": 12,
    "height": 10
  },
  "images": [
    {
      "url": "https://...",
      "is_primary": true,
      "position": 1
    }
  ],
  "tags": ["new-arrival"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "slug": "air-max-90",
    ...
  }
}
```

---

### Update Product
```http
PUT /brand/me/products/:id
```

**Request Body:**
```json
{
  "name": "Air Max 90 Updated",
  "description": "Updated description",
  "price": 160000,
  "compare_at_price": 200000,
  "status": "active",
  "stock_quantity": 60,
  "images": [...]
}
```

**Note:** Cannot change `branch_id` after creation

---

### Update Product Status
```http
PATCH /brand/me/products/:id/status
```

**Request Body:**
```json
{
  "status": "active"      // draft, active, archived
}
```

---

### Delete Product
```http
DELETE /brand/me/products/:id
```

**Note:** Soft delete - sets status to `archived`

---

### Bulk Update Products
```http
PATCH /brand/me/products/bulk
```

**Request Body:**
```json
{
  "product_ids": ["uuid1", "uuid2"],
  "updates": {
    "status": "archived"
  }
}
```

---

## 📊 Variants Module

### List Product Variants
```http
GET /brand/me/products/:productId/variants
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "sku": "NIKE-AM90-001-42-BLK",
      "size": "42",
      "color": "Black",
      "color_hex": "#000000",
      "price_modifier": 0,
      "stock_quantity": 15,
      "is_active": true,
      "created_at": "2026-01-06T00:00:00Z"
    }
  ]
}
```

---

### Create Variant
```http
POST /brand/me/products/:productId/variants
```

**Request Body:**
```json
{
  "sku": "NIKE-AM90-001-44-BLK",     // Required, unique
  "size": "44",
  "color": "Black",
  "color_hex": "#000000",
  "price_modifier": 0,                // + or - from base price
  "stock_quantity": 20,               // Required
  "is_active": true
}
```

---

### Update Variant
```http
PUT /brand/me/products/:productId/variants/:variantId
```

**Request Body:**
```json
{
  "price_modifier": 5000,
  "stock_quantity": 25,
  "is_active": true
}
```

---

### Delete Variant
```http
DELETE /brand/me/products/:productId/variants/:variantId
```

---

### Bulk Create Variants
```http
POST /brand/me/products/:productId/variants/bulk
```

**Request Body:**
```json
{
  "variants": [
    {
      "size": "40",
      "color": "Black",
      "color_hex": "#000000",
      "stock_quantity": 10
    },
    {
      "size": "41",
      "color": "Black",
      "color_hex": "#000000",
      "stock_quantity": 12
    },
    {
      "size": "42",
      "color": "Black",
      "color_hex": "#000000",
      "stock_quantity": 15
    }
  ],
  "auto_generate_sku": true      // Auto-generate SKUs based on product SKU
}
```

---

## 📦 Inventory Module

### Get Inventory Overview
```http
GET /brand/me/inventory
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `branch_id` | uuid | - | Filter by branch |

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_products": 150,
      "total_variants": 500,
      "total_stock": 5000,
      "total_value": 750000000,
      "in_stock": 400,
      "low_stock": 50,
      "out_of_stock": 50
    },
    "alerts": [
      {
        "type": "out_of_stock",
        "product_id": "uuid",
        "product_name": "Air Max 90",
        "variant": "Size 42, Black",
        "sku": "NIKE-AM90-001-42-BLK"
      },
      {
        "type": "low_stock",
        "product_id": "uuid",
        "product_name": "Air Force 1",
        "variant": "Size 40, White",
        "sku": "NIKE-AF1-001-40-WHT",
        "current_stock": 3,
        "threshold": 10
      }
    ]
  }
}
```

---

### Update Stock
```http
PATCH /brand/me/inventory/stock
```

**Request Body:**
```json
{
  "variant_id": "uuid",
  "quantity": 50,
  "operation": "set",        // set, add, subtract
  "reason": "Restock from warehouse"
}
```

---

### Bulk Update Stock
```http
PATCH /brand/me/inventory/stock/bulk
```

**Request Body:**
```json
{
  "updates": [
    {
      "variant_id": "uuid1",
      "quantity": 50,
      "operation": "set"
    },
    {
      "variant_id": "uuid2",
      "quantity": 10,
      "operation": "add"
    }
  ],
  "reason": "Weekly restock"
}
```

---

### Get Stock History
```http
GET /brand/me/inventory/history
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `product_id` | uuid | - | Filter by product |
| `variant_id` | uuid | - | Filter by variant |
| `date_from` | date | - | Start date |
| `date_to` | date | - | End date |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "variant_id": "uuid",
      "product_name": "Air Max 90",
      "variant_name": "Size 42, Black",
      "previous_quantity": 20,
      "new_quantity": 50,
      "change": 30,
      "operation": "add",
      "reason": "Restock",
      "changed_by": "manager@nike.com",
      "created_at": "2026-01-06T10:00:00Z"
    }
  ]
}
```

---

## 📋 Orders Module

### List My Brand Orders
```http
GET /brand/me/orders
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `limit` | int | 20 | Items per page |
| `branch_id` | uuid | - | Filter by branch |
| `status` | string | - | Filter by status |
| `date_from` | date | - | Orders from date |
| `date_to` | date | - | Orders to date |
| `sort` | string | `created_at` | Sort field |
| `order` | string | `desc` | Sort order |

**Note:** Only returns orders containing products from manager's brand/branch

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "order_number": "LB-2026-00001",
      "status": "pending",
      "created_at": "2026-01-06T10:00:00Z",
      "customer": {
        "full_name": "John Doe",
        "phone": "+998901234567"
      },
      "shipping_address": {
        "city": "Tashkent",
        "district": "Chilanzar",
        "address": "123 Main St"
      },
      "my_items": [
        {
          "id": "uuid",
          "product_id": "uuid",
          "product_name": "Air Max 90",
          "variant_name": "Size 42, Black",
          "sku": "NIKE-AM90-001-42-BLK",
          "price": 150000,
          "quantity": 1,
          "total": 150000,
          "image_url": "https://...",
          "branch_id": "uuid",
          "branch_name": "Nike Tashkent City"
        }
      ],
      "my_items_total": 150000,
      "order_total": 300000      // Full order total (includes other brands)
    }
  ],
  "pagination": {...}
}
```

---

### Get Order Details
```http
GET /brand/me/orders/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "order_number": "LB-2026-00001",
    "status": "pending",
    "payment_status": "pending",
    "payment_method": "cash_on_delivery",
    "created_at": "2026-01-06T10:00:00Z",
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
    "my_items": [
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
        "branch_id": "uuid",
        "branch_name": "Nike Tashkent City",
        "status": "pending"           // Item-level status
      }
    ],
    "my_items_subtotal": 300000,
    "notes": "Customer notes...",
    "status_history": [
      {
        "status": "pending",
        "changed_at": "2026-01-06T10:00:00Z",
        "note": "Order placed"
      }
    ]
  }
}
```

---

### Update Order Item Status
```http
PATCH /brand/me/orders/:orderId/items/:itemId/status
```

**Request Body:**
```json
{
  "status": "processing",
  "note": "Preparing item for shipment"
}
```

**Item Statuses:**
- `pending` - Awaiting processing
- `processing` - Being prepared
- `ready` - Ready for pickup/shipment
- `shipped` - In transit
- `delivered` - Delivered
- `cancelled` - Cancelled

**Note:** Brand managers can only update status of their own items

---

### Mark Items as Ready
```http
POST /brand/me/orders/:orderId/ready
```

**Request Body:**
```json
{
  "item_ids": ["uuid1", "uuid2"],
  "note": "All items packed and ready"
}
```

---

## ⭐ Reviews Module

### List Product Reviews
```http
GET /brand/me/reviews
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `product_id` | uuid | - | Filter by product |
| `rating` | int | - | Filter by rating (1-5) |
| `responded` | boolean | - | Filter by response status |
| `sort` | string | `created_at` | Sort field |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "product_name": "Air Max 90",
      "product_image": "https://...",
      "rating": 5,
      "title": "Great quality!",
      "comment": "Very comfortable shoes",
      "images": ["https://..."],
      "is_verified_purchase": true,
      "created_at": "2026-01-06T00:00:00Z",
      "user": {
        "full_name": "John D.",
        "avatar_url": "https://..."
      },
      "response": null
    }
  ],
  "pagination": {...},
  "summary": {
    "average_rating": 4.5,
    "total_reviews": 150,
    "rating_distribution": {
      "5": 80,
      "4": 40,
      "3": 20,
      "2": 5,
      "1": 5
    }
  }
}
```

---

### Respond to Review
```http
POST /brand/me/reviews/:id/respond
```

**Request Body:**
```json
{
  "response": "Thank you for your feedback! We're glad you love the product."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "response": "Thank you for your feedback!...",
    "responded_at": "2026-01-06T12:00:00Z",
    "responded_by": "manager@nike.com"
  }
}
```

---

### Update Response
```http
PUT /brand/me/reviews/:id/respond
```

**Request Body:**
```json
{
  "response": "Updated response text"
}
```

---

## 📊 Analytics & Reports Module

### Dashboard Overview
```http
GET /brand/me/analytics/dashboard
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | string | `30d` | Period: `7d`, `30d`, `90d` |
| `branch_id` | uuid | - | Filter by branch |

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_revenue": 50000000,
      "revenue_change": 15.5,
      "total_orders": 250,
      "orders_change": 12.3,
      "average_order_value": 200000,
      "aov_change": 2.8,
      "products_sold": 300,
      "products_sold_change": 18.2
    },
    "revenue_chart": [
      {"date": "2026-01-01", "revenue": 1500000, "orders": 8},
      {"date": "2026-01-02", "revenue": 1800000, "orders": 10}
    ],
    "top_products": [
      {
        "id": "uuid",
        "name": "Air Max 90",
        "image_url": "https://...",
        "total_sold": 45,
        "revenue": 6750000
      }
    ],
    "orders_by_status": {
      "pending": 15,
      "processing": 10,
      "ready": 5,
      "shipped": 20,
      "delivered": 180,
      "cancelled": 20
    },
    "inventory_alerts": {
      "out_of_stock": 5,
      "low_stock": 12
    }
  }
}
```

---

### Sales Report
```http
GET /brand/me/analytics/sales
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `date_from` | date | - | Start date |
| `date_to` | date | - | End date |
| `group_by` | string | `day` | Group: `day`, `week`, `month` |
| `branch_id` | uuid | - | Filter by branch |
| `category_id` | uuid | - | Filter by category |

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_revenue": 50000000,
      "total_orders": 250,
      "total_items_sold": 300,
      "average_order_value": 200000
    },
    "by_period": [
      {
        "period": "2026-01-01",
        "revenue": 1500000,
        "orders": 8,
        "items_sold": 12
      }
    ],
    "by_category": [
      {
        "category": "Sneakers",
        "revenue": 30000000,
        "percentage": 60
      }
    ],
    "by_product": [
      {
        "product": "Air Max 90",
        "revenue": 6750000,
        "quantity": 45
      }
    ]
  }
}
```

---

### Products Performance
```http
GET /brand/me/analytics/products
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | string | `30d` | Period: `7d`, `30d`, `90d` |
| `sort` | string | `revenue` | Sort: `revenue`, `quantity`, `views` |
| `limit` | int | 20 | Number of products |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Air Max 90",
      "sku": "NIKE-AM90-001",
      "image_url": "https://...",
      "price": 150000,
      "revenue": 6750000,
      "quantity_sold": 45,
      "views": 1500,
      "conversion_rate": 3.0,
      "favorites": 120,
      "average_rating": 4.5,
      "stock_quantity": 50,
      "stock_status": "in_stock"
    }
  ]
}
```

---

### Export Report
```http
GET /brand/me/analytics/export
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | string | - | Report: `sales`, `products`, `inventory`, `orders` |
| `format` | string | `csv` | Format: `csv`, `xlsx` |
| `date_from` | date | - | Start date |
| `date_to` | date | - | End date |

**Response:** File download

---

## 📁 File Upload

### Upload Product Image
```http
POST /brand/me/upload/product-image
Content-Type: multipart/form-data
```

**Form Data:**
- `file` - Image file (max 5MB, jpg/png/webp)
- `product_id` - Product ID (optional, for organization)

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://storage.../products/brand-uuid/image.jpg",
    "thumbnail_url": "https://storage.../products/brand-uuid/image_thumb.jpg"
  }
}
```

---

### Upload Multiple Images
```http
POST /brand/me/upload/product-images
Content-Type: multipart/form-data
```

**Form Data:**
- `files[]` - Multiple image files (max 10 files, 5MB each)
- `product_id` - Product ID (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "url": "https://storage.../image1.jpg",
      "thumbnail_url": "https://storage.../image1_thumb.jpg"
    },
    {
      "url": "https://storage.../image2.jpg",
      "thumbnail_url": "https://storage.../image2_thumb.jpg"
    }
  ]
}
```

---

## 🔔 Notifications Module

### Get My Notifications
```http
GET /brand/me/notifications
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `unread_only` | boolean | false | Filter unread |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "new_order",
      "title": "New Order Received",
      "message": "Order #LB-2026-00001 includes 2 items from your brand",
      "data": {
        "order_id": "uuid",
        "order_number": "LB-2026-00001"
      },
      "is_read": false,
      "created_at": "2026-01-06T10:00:00Z"
    }
  ],
  "unread_count": 5
}
```

---

### Mark Notification as Read
```http
PATCH /brand/me/notifications/:id/read
```

---

### Mark All as Read
```http
PATCH /brand/me/notifications/read-all
```

---

## 📦 Categories (Read-Only)

### Get Categories Tree
```http
GET /categories
```

**Note:** Brand managers can view categories but cannot modify them

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Men",
      "slug": "men",
      "children": [
        {
          "id": "uuid",
          "name": "Shoes",
          "slug": "men-shoes",
          "children": [...]
        }
      ]
    }
  ]
}
```

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
| Code | HTTP | Description |
|------|------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing token |
| `FORBIDDEN` | 403 | No access to this resource |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `CONFLICT` | 409 | Duplicate resource (e.g., SKU exists) |
| `BRAND_ACCESS_DENIED` | 403 | Not your brand's resource |
| `BRANCH_ACCESS_DENIED` | 403 | Not your branch's resource |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Access Control Summary

| Resource | Brand-Level Manager | Branch-Level Manager |
|----------|--------------------|--------------------|
| View all branches | ✅ | ❌ (own branch only) |
| Edit branch info | ✅ | ✅ (own branch only) |
| Create products | ✅ (any branch) | ✅ (own branch only) |
| View products | ✅ (all) | ✅ (own branch only) |
| Edit products | ✅ (all) | ✅ (own branch only) |
| View orders | ✅ (all) | ✅ (own branch only) |
| Update order status | ✅ (all) | ✅ (own branch only) |
| View analytics | ✅ (all) | ✅ (own branch only) |
| Respond to reviews | ✅ | ✅ (own products) |

