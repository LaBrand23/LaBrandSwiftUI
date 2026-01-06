# LaBrand API Overview

**Base URL:** `https://asia-south1-labrand-ef645.cloudfunctions.net/api`

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE APP (iOS)                          │
│                      (Client Users Only)                         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────────┐
│                    ADMIN PANEL (Web)                             │
│                 (Root Admin + Admin)                             │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────────┐
│                   BRAND PORTAL (Web)                             │
│                   (Brand Managers)                               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│               FIREBASE CLOUD FUNCTIONS                           │
│                    (API Gateway)                                 │
│        https://asia-south1-labrand-ef645.cloudfunctions.net/api │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   SUPABASE   │  │   FIREBASE   │  │   FIREBASE   │
│  PostgreSQL  │  │  Firestore   │  │   Storage    │
│   (Main DB)  │  │ (Real-time)  │  │   (Files)    │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 👥 Role-Based Access Control

### Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                       ROOT_ADMIN                                 │
│  • Full system access                                           │
│  • User role management                                         │
│  • System settings                                              │
│  • Delete operations                                            │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                         ADMIN                                    │
│  • Manage brands, products, categories                          │
│  • Manage orders                                                │
│  • View analytics                                               │
│  • Cannot delete critical data                                  │
│  • Cannot manage user roles                                     │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BRAND_MANAGER                                │
│  • Manage own brand's products                                  │
│  • View/process own brand's orders                              │
│  • Manage inventory                                             │
│  • View analytics (own brand only)                              │
│  • Respond to reviews                                           │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT                                    │
│  • Browse products                                              │
│  • Place orders                                                 │
│  • Manage favorites                                             │
│  • Write reviews                                                │
│  • View own orders                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 API Endpoints by Project

### 1️⃣ Mobile App (Client) - `API_CLIENT.md`

| Module | Endpoints | Auth Required |
|--------|-----------|---------------|
| **Categories** | GET /categories | ❌ |
| **Products** | GET /products, GET /products/:id | ❌ |
| **Brands** | GET /brands | ❌ |
| **Auth** | POST /auth/register, POST /auth/login | ❌ |
| **Profile** | GET/PUT /users/me | ✅ |
| **Favorites** | GET/POST/DELETE /favorites | ✅ |
| **Cart** | GET/POST/PUT/DELETE /cart | ✅ |
| **Orders** | GET/POST /orders | ✅ |
| **Reviews** | GET/POST /reviews | ✅ |
| **Addresses** | GET/POST/PUT/DELETE /addresses | ✅ |

---

### 2️⃣ Admin Panel - `API_ADMIN_PANEL.md`

| Module | Key Endpoints | Role |
|--------|--------------|------|
| **Users** | CRUD /users | admin, root_admin |
| **User Roles** | PATCH /users/:id/role | root_admin |
| **Brands** | CRUD /brands | admin, root_admin |
| **Branches** | CRUD /brands/:id/branches | admin, root_admin |
| **Categories** | CRUD /categories | admin, root_admin |
| **Products** | CRUD /products | admin, root_admin |
| **Orders** | GET/PATCH /orders | admin, root_admin |
| **Reviews** | Approve/Delete /reviews | admin, root_admin |
| **Analytics** | GET /analytics/* | admin, root_admin |
| **Promo Codes** | CRUD /promo-codes | admin, root_admin |
| **Settings** | GET/PUT /settings | root_admin |
| **Notifications** | POST /notifications/push | admin, root_admin |

---

### 3️⃣ Brand Portal - `API_BRAND_PORTAL.md`

| Module | Key Endpoints | Scope |
|--------|--------------|-------|
| **Profile** | GET/PUT /users/me | Own profile |
| **My Brand** | GET/PUT /brand/me | Own brand |
| **Branches** | GET/PUT /brand/me/branches | Own branches |
| **Products** | CRUD /brand/me/products | Own products |
| **Variants** | CRUD /brand/me/products/:id/variants | Own variants |
| **Inventory** | GET/PATCH /brand/me/inventory | Own inventory |
| **Orders** | GET/PATCH /brand/me/orders | Own brand orders |
| **Reviews** | GET/POST /brand/me/reviews | Own products |
| **Analytics** | GET /brand/me/analytics/* | Own brand |
| **Upload** | POST /brand/me/upload/* | Own files |

---

## 🔐 Authentication Flow

### Firebase Authentication

```
1. User signs in with Firebase Auth
   └─> Firebase returns ID Token

2. Client includes token in requests
   └─> Authorization: Bearer <firebase_id_token>

3. API validates token
   └─> Extracts firebase_uid
   └─> Looks up user in Supabase
   └─> Checks role and permissions

4. Request processed based on role
```

### Token Refresh

Firebase tokens expire after 1 hour. Clients should:
1. Store refresh token securely
2. Refresh ID token before expiry
3. Handle 401 errors by refreshing token

---

## 📁 Database Schema

### Supabase PostgreSQL Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts, roles, profile |
| `brands` | Brand information |
| `branches` | Brand branch locations |
| `categories` | Product categories (hierarchical) |
| `products` | Product catalog |
| `product_variants` | Size/color variants |
| `orders` | Customer orders |
| `order_items` | Order line items |
| `favorites` | User favorites |
| `reviews` | Product reviews |
| `addresses` | User addresses |
| `promo_codes` | Discount codes |

### Firestore Collections (Real-time)

| Collection | Purpose |
|------------|---------|
| `carts/{userId}` | Real-time cart sync |
| `notifications/{userId}` | Push notifications |
| `order_status/{orderId}` | Live order tracking |

---

## 🚀 API Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "pagination": {          // For list endpoints
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Human readable message",
  "code": "ERROR_CODE",
  "details": { ... }        // Optional validation details
}
```

---

## 📊 Quick Reference: Permissions Matrix

| Action | Client | Brand Manager | Admin | Root Admin |
|--------|--------|---------------|-------|------------|
| Browse products | ✅ | ✅ | ✅ | ✅ |
| Place orders | ✅ | ❌ | ❌ | ❌ |
| Write reviews | ✅ | ❌ | ❌ | ❌ |
| Manage favorites | ✅ | ❌ | ❌ | ❌ |
| Create products | ❌ | ✅ (own brand) | ✅ | ✅ |
| Edit products | ❌ | ✅ (own brand) | ✅ | ✅ |
| Delete products | ❌ | ✅ (own brand) | ✅ | ✅ |
| View all orders | ❌ | ❌ | ✅ | ✅ |
| View brand orders | ❌ | ✅ (own brand) | ✅ | ✅ |
| Update order status | ❌ | ✅ (own items) | ✅ | ✅ |
| Create brands | ❌ | ❌ | ✅ | ✅ |
| Delete brands | ❌ | ❌ | ❌ | ✅ |
| Manage categories | ❌ | ❌ | ✅ | ✅ |
| Delete categories | ❌ | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ | ✅ |
| Change user roles | ❌ | ❌ | ❌ | ✅ |
| View analytics | ❌ | ✅ (own brand) | ✅ | ✅ |
| System settings | ❌ | ❌ | ❌ | ✅ |

---

## 📱 Project Structure

```
LaBrand Platform
├── Mobile App (iOS - SwiftUI)
│   └── Client users only
│   └── API: Public + Authenticated endpoints
│
├── Admin Panel (Web - React/Next.js)
│   └── Root Admin + Admin roles
│   └── API: /users, /brands, /categories, /products, /orders, /analytics
│
└── Brand Portal (Web - React/Next.js)
    └── Brand Manager role
    └── API: /brand/me/*, /users/me
```

---

## 📝 Documentation Files

| File | Description |
|------|-------------|
| `API_OVERVIEW.md` | This file - architecture overview |
| `API_ADMIN_PANEL.md` | Admin panel API documentation |
| `API_BRAND_PORTAL.md` | Brand portal API documentation |
| `API_CLIENT.md` | Mobile app API documentation (to be created) |

---

## 🔗 Related Resources

- **Firebase Console:** https://console.firebase.google.com/project/labrand-ef645
- **Supabase Dashboard:** https://supabase.com/dashboard/project/uuirxtxqygpmqiunhkgs
- **API Health Check:** https://asia-south1-labrand-ef645.cloudfunctions.net/api/health

