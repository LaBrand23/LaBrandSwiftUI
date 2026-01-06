# LaBrand Mobile App API Documentation

**Base URL:** `https://asia-south1-labrand-ef645.cloudfunctions.net/api`

**Role:** `client` (regular users)

---

## 🔐 Authentication

### Public Endpoints (No Auth Required)
- Categories
- Products listing
- Product details
- Brands listing

### Authenticated Endpoints (Token Required)
```
Authorization: Bearer <firebase_id_token>
```

---

## 📂 Categories Module

### Get Category Tree
```http
GET /categories
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
      "children": [
        {
          "id": "uuid",
          "parent_id": "parent_uuid",
          "name": "Clothing",
          "slug": "men-clothing",
          "children": [
            {
              "id": "uuid",
              "name": "T-Shirts",
              "slug": "men-tshirts",
              "children": []
            }
          ]
        }
      ]
    }
  ]
}
```

---

### Get Category by ID
```http
GET /categories/:id
```

---

### Get Category by Slug
```http
GET /categories/slug/:slug
```

---

## 🛍️ Products Module

### List Products
```http
GET /products
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `limit` | int | 20 | Items per page (max 50) |
| `category_id` | uuid | - | Filter by category |
| `brand_id` | uuid | - | Filter by brand |
| `gender` | string | - | Filter: `men`, `women`, `kids`, `unisex` |
| `search` | string | - | Search in name |
| `min_price` | int | - | Minimum price |
| `max_price` | int | - | Maximum price |
| `size` | string | - | Filter by size |
| `color` | string | - | Filter by color |
| `is_on_sale` | boolean | - | Sale items only |
| `is_new` | boolean | - | New arrivals only |
| `sort` | string | `created_at` | Sort: `price`, `name`, `rating`, `created_at` |
| `order` | string | `desc` | Order: `asc`, `desc` |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Air Max 90",
      "slug": "air-max-90",
      "price": 150000,
      "compare_at_price": 180000,
      "is_on_sale": true,
      "discount_percentage": 17,
      "images": ["https://..."],
      "brand": {
        "id": "uuid",
        "name": "Nike",
        "logo_url": "https://..."
      },
      "category": {
        "id": "uuid",
        "name": "Sneakers"
      },
      "rating": 4.5,
      "reviews_count": 25,
      "is_new": true,
      "is_favorite": false,
      "in_stock": true,
      "available_sizes": ["40", "41", "42", "43", "44"],
      "available_colors": [
        {"name": "Black", "hex": "#000000"},
        {"name": "White", "hex": "#FFFFFF"}
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "available_sizes": ["38", "39", "40", "41", "42", "43", "44", "45"],
    "available_colors": ["Black", "White", "Red", "Blue"],
    "price_range": {
      "min": 50000,
      "max": 500000
    },
    "brands": [
      {"id": "uuid", "name": "Nike", "count": 50},
      {"id": "uuid", "name": "Adidas", "count": 30}
    ]
  }
}
```

---

### Get Product Details
```http
GET /products/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Air Max 90",
    "slug": "air-max-90",
    "sku": "NIKE-AM90-001",
    "description": "The Nike Air Max 90 stays true to its OG roots...",
    "short_description": "Iconic Air Max sneaker",
    "price": 150000,
    "compare_at_price": 180000,
    "is_on_sale": true,
    "discount_percentage": 17,
    "images": [
      {
        "url": "https://...",
        "is_primary": true
      }
    ],
    "brand": {
      "id": "uuid",
      "name": "Nike",
      "slug": "nike",
      "logo_url": "https://..."
    },
    "category": {
      "id": "uuid",
      "name": "Sneakers",
      "path": ["Men", "Shoes", "Sneakers"]
    },
    "variants": [
      {
        "id": "uuid",
        "size": "42",
        "color": "Black",
        "color_hex": "#000000",
        "price": 150000,
        "in_stock": true,
        "stock_quantity": 15
      },
      {
        "id": "uuid",
        "size": "42",
        "color": "White",
        "color_hex": "#FFFFFF",
        "price": 160000,
        "in_stock": true,
        "stock_quantity": 8
      }
    ],
    "available_sizes": ["40", "41", "42", "43", "44"],
    "available_colors": [
      {"name": "Black", "hex": "#000000"},
      {"name": "White", "hex": "#FFFFFF"}
    ],
    "rating": 4.5,
    "reviews_count": 25,
    "is_new": true,
    "is_favorite": false,
    "in_stock": true,
    "tags": ["bestseller", "new-arrival"],
    "related_products": [
      {
        "id": "uuid",
        "name": "Air Max 95",
        "price": 180000,
        "image_url": "https://...",
        "brand_name": "Nike"
      }
    ]
  }
}
```

---

### Get Product by Slug
```http
GET /products/slug/:slug
```

---

### Get New Arrivals
```http
GET /products/new-arrivals
```

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| `limit` | int | 10 |
| `gender` | string | - |

---

### Get Featured Products
```http
GET /products/featured
```

---

### Get Sale Products
```http
GET /products/on-sale
```

---

## 🏢 Brands Module

### List Brands
```http
GET /brands
```

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| `page` | int | 1 |
| `limit` | int | 50 |
| `featured` | boolean | - |

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
      "is_featured": true,
      "products_count": 150
    }
  ]
}
```

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
    "is_featured": true,
    "products_count": 150,
    "categories": [
      {"id": "uuid", "name": "Sneakers", "count": 80},
      {"id": "uuid", "name": "Clothing", "count": 70}
    ]
  }
}
```

---

### Get Brand Products
```http
GET /brands/:id/products
```

Same query parameters as `/products`

---

## 🔐 Auth Module

### Register
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "+998901234567"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "client"
    },
    "token": "firebase_id_token",
    "refresh_token": "firebase_refresh_token"
  }
}
```

---

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

### Social Login
```http
POST /auth/social
```

**Request Body:**
```json
{
  "provider": "google",          // google, apple
  "id_token": "provider_token"
}
```

---

### Forgot Password
```http
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

---

### Refresh Token
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "firebase_refresh_token"
}
```

---

## 👤 Profile Module (Auth Required)

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
    "email": "user@example.com",
    "full_name": "John Doe",
    "avatar_url": "https://...",
    "phone": "+998901234567",
    "created_at": "2026-01-06T00:00:00Z",
    "statistics": {
      "orders_count": 5,
      "favorites_count": 12,
      "reviews_count": 3
    }
  }
}
```

---

### Update Profile
```http
PUT /users/me
```

**Request Body:**
```json
{
  "full_name": "John Updated",
  "phone": "+998901234567",
  "avatar_url": "https://..."
}
```

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

### Delete Account
```http
DELETE /users/me
```

**Request Body:**
```json
{
  "password": "currentpassword",
  "reason": "Optional reason for leaving"
}
```

---

## 📍 Addresses Module (Auth Required)

### List My Addresses
```http
GET /addresses
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "label": "Home",
      "full_name": "John Doe",
      "phone": "+998901234567",
      "city": "Tashkent",
      "district": "Chilanzar",
      "address": "123 Main St, Apt 4",
      "postal_code": "100000",
      "is_default": true,
      "latitude": 41.311081,
      "longitude": 69.240562
    }
  ]
}
```

---

### Add Address
```http
POST /addresses
```

**Request Body:**
```json
{
  "label": "Work",
  "full_name": "John Doe",
  "phone": "+998901234567",
  "city": "Tashkent",
  "district": "Yunusabad",
  "address": "456 Business Ave",
  "postal_code": "100100",
  "is_default": false,
  "latitude": 41.350000,
  "longitude": 69.300000
}
```

---

### Update Address
```http
PUT /addresses/:id
```

---

### Delete Address
```http
DELETE /addresses/:id
```

---

### Set Default Address
```http
PATCH /addresses/:id/default
```

---

## ❤️ Favorites Module (Auth Required)

### Get My Favorites
```http
GET /favorites
```

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| `page` | int | 1 |
| `limit` | int | 20 |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "added_at": "2026-01-06T00:00:00Z",
      "product": {
        "id": "uuid",
        "name": "Air Max 90",
        "price": 150000,
        "compare_at_price": 180000,
        "image_url": "https://...",
        "brand_name": "Nike",
        "in_stock": true
      }
    }
  ],
  "pagination": {...}
}
```

---

### Add to Favorites
```http
POST /favorites
```

**Request Body:**
```json
{
  "product_id": "uuid"
}
```

---

### Remove from Favorites
```http
DELETE /favorites/:productId
```

---

### Check if Product is Favorited
```http
GET /favorites/check/:productId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "is_favorite": true
  }
}
```

---

## 🛒 Cart Module (Auth Required)

### Get My Cart
```http
GET /cart
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "variant_id": "uuid",
        "quantity": 2,
        "product": {
          "id": "uuid",
          "name": "Air Max 90",
          "price": 150000,
          "image_url": "https://...",
          "brand_name": "Nike"
        },
        "variant": {
          "id": "uuid",
          "size": "42",
          "color": "Black",
          "price": 150000,
          "in_stock": true,
          "stock_quantity": 15
        },
        "subtotal": 300000
      }
    ],
    "summary": {
      "items_count": 2,
      "subtotal": 300000,
      "discount": 0,
      "shipping": 15000,
      "total": 315000
    }
  }
}
```

---

### Add to Cart
```http
POST /cart
```

**Request Body:**
```json
{
  "product_id": "uuid",
  "variant_id": "uuid",
  "quantity": 1
}
```

---

### Update Cart Item
```http
PUT /cart/:itemId
```

**Request Body:**
```json
{
  "quantity": 3
}
```

---

### Remove from Cart
```http
DELETE /cart/:itemId
```

---

### Clear Cart
```http
DELETE /cart
```

---

### Apply Promo Code
```http
POST /cart/promo
```

**Request Body:**
```json
{
  "code": "SAVE10"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "code": "SAVE10",
    "type": "percentage",
    "value": 10,
    "discount_amount": 30000,
    "message": "10% discount applied!"
  }
}
```

---

### Remove Promo Code
```http
DELETE /cart/promo
```

---

## 📦 Orders Module (Auth Required)

### Get My Orders
```http
GET /orders
```

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| `page` | int | 1 |
| `limit` | int | 20 |
| `status` | string | - |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "order_number": "LB-2026-00001",
      "status": "delivered",
      "total": 315000,
      "items_count": 2,
      "created_at": "2026-01-06T00:00:00Z",
      "items_preview": [
        {
          "product_name": "Air Max 90",
          "image_url": "https://..."
        }
      ]
    }
  ],
  "pagination": {...}
}
```

---

### Get Order Details
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
    "status": "shipped",
    "payment_method": "cash_on_delivery",
    "payment_status": "pending",
    "subtotal": 300000,
    "discount_amount": 0,
    "shipping_cost": 15000,
    "total": 315000,
    "created_at": "2026-01-06T00:00:00Z",
    "shipping_address": {
      "full_name": "John Doe",
      "phone": "+998901234567",
      "city": "Tashkent",
      "district": "Chilanzar",
      "address": "123 Main St, Apt 4"
    },
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "product_name": "Air Max 90",
        "variant_name": "Size 42, Black",
        "price": 150000,
        "quantity": 2,
        "total": 300000,
        "image_url": "https://...",
        "brand_name": "Nike"
      }
    ],
    "status_history": [
      {
        "status": "pending",
        "timestamp": "2026-01-06T10:00:00Z"
      },
      {
        "status": "confirmed",
        "timestamp": "2026-01-06T10:30:00Z"
      },
      {
        "status": "shipped",
        "timestamp": "2026-01-06T14:00:00Z"
      }
    ],
    "tracking": {
      "carrier": "Express Delivery",
      "tracking_number": "UZ123456789",
      "tracking_url": "https://..."
    }
  }
}
```

---

### Create Order
```http
POST /orders
```

**Request Body:**
```json
{
  "address_id": "uuid",
  "payment_method": "cash_on_delivery",    // cash_on_delivery, card, payme, click
  "promo_code": "SAVE10",                   // Optional
  "notes": "Please call before delivery"    // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "order_number": "LB-2026-00001",
    "status": "pending",
    "total": 315000,
    "payment_url": null                      // For online payment methods
  }
}
```

---

### Cancel Order
```http
POST /orders/:id/cancel
```

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

**Note:** Can only cancel orders in `pending` or `confirmed` status

---

### Reorder
```http
POST /orders/:id/reorder
```

Adds all items from a previous order to cart

---

## ⭐ Reviews Module

### Get Product Reviews
```http
GET /products/:productId/reviews
```

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| `page` | int | 1 |
| `limit` | int | 20 |
| `rating` | int | - |
| `sort` | string | `created_at` |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "rating": 5,
      "title": "Great quality!",
      "comment": "Very comfortable shoes, highly recommend",
      "images": ["https://..."],
      "is_verified_purchase": true,
      "created_at": "2026-01-06T00:00:00Z",
      "user": {
        "full_name": "John D.",
        "avatar_url": "https://..."
      },
      "response": {
        "comment": "Thank you for your feedback!",
        "responded_at": "2026-01-07T00:00:00Z"
      },
      "helpful_count": 12
    }
  ],
  "summary": {
    "average_rating": 4.5,
    "total_reviews": 25,
    "rating_distribution": {
      "5": 15,
      "4": 6,
      "3": 2,
      "2": 1,
      "1": 1
    }
  },
  "pagination": {...}
}
```

---

### Create Review (Auth Required)
```http
POST /products/:productId/reviews
```

**Request Body:**
```json
{
  "rating": 5,
  "title": "Amazing product!",
  "comment": "Very happy with my purchase",
  "images": ["https://..."]
}
```

**Note:** User must have purchased the product to review

---

### Update My Review (Auth Required)
```http
PUT /reviews/:id
```

---

### Delete My Review (Auth Required)
```http
DELETE /reviews/:id
```

---

### Mark Review Helpful
```http
POST /reviews/:id/helpful
```

---

## 🔔 Notifications Module (Auth Required)

### Get My Notifications
```http
GET /notifications
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "order_shipped",
      "title": "Your order is on the way!",
      "message": "Order #LB-2026-00001 has been shipped",
      "data": {
        "order_id": "uuid"
      },
      "is_read": false,
      "created_at": "2026-01-06T14:00:00Z"
    }
  ],
  "unread_count": 3
}
```

---

### Mark as Read
```http
PATCH /notifications/:id/read
```

---

### Mark All as Read
```http
PATCH /notifications/read-all
```

---

### Register Push Token
```http
POST /notifications/token
```

**Request Body:**
```json
{
  "token": "fcm_device_token",
  "platform": "ios"
}
```

---

## 🔍 Search Module

### Search Products
```http
GET /search
```

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| `q` | string | - |
| `page` | int | 1 |
| `limit` | int | 20 |

---

### Search Suggestions
```http
GET /search/suggestions
```

**Query Parameters:**
| Param | Type |
|-------|------|
| `q` | string |

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {"id": "uuid", "name": "Air Max 90", "image_url": "https://..."}
    ],
    "brands": [
      {"id": "uuid", "name": "Nike"}
    ],
    "categories": [
      {"id": "uuid", "name": "Sneakers"}
    ],
    "recent_searches": [
      "nike shoes",
      "black sneakers"
    ]
  }
}
```

---

## 🏠 Home Module

### Get Home Data
```http
GET /home
```

**Response:**
```json
{
  "success": true,
  "data": {
    "banners": [
      {
        "id": "uuid",
        "image_url": "https://...",
        "title": "Summer Sale",
        "subtitle": "Up to 50% off",
        "link_type": "category",
        "link_id": "uuid"
      }
    ],
    "categories": [
      {
        "id": "uuid",
        "name": "Men",
        "image_url": "https://..."
      }
    ],
    "featured_brands": [...],
    "new_arrivals": [...],
    "trending_products": [...],
    "sale_products": [...]
  }
}
```

---

## Error Responses

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Common Codes:**
| Code | HTTP | Description |
|------|------|-------------|
| `UNAUTHORIZED` | 401 | Token missing/invalid |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request |
| `OUT_OF_STOCK` | 400 | Product unavailable |
| `CART_EMPTY` | 400 | Cannot checkout empty cart |
| `ORDER_CANNOT_CANCEL` | 400 | Order already processed |
| `REVIEW_EXISTS` | 409 | Already reviewed |
| `NOT_PURCHASED` | 403 | Must buy to review |

