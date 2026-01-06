# LaBrand Web Platform - Technical Implementation Plan

**For Use With:** Claude Terminal + Ralph Wiggum Plugin  
**Completion Promise:** `<promise>LABRAND WEB PLATFORM COMPLETE</promise>`  

---

## 🎯 PROJECT OVERVIEW

Build two web applications for the LaBrand fashion e-commerce platform:

1. **Admin Panel** (`/web/admin`) - For `root_admin` and `admin` roles
2. **Brand Portal** (`/web/brand-portal`) - For `brand_manager` role

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend Framework** | Next.js 14 (App Router) |
| **UI Library** | React 18 |
| **Styling** | Tailwind CSS + Custom Design System |
| **State Management** | Zustand + TanStack Query |
| **Authentication** | Firebase Auth |
| **API Client** | Axios + Custom Hooks |
| **Forms** | React Hook Form + Zod |
| **Tables** | TanStack Table |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Date Handling** | date-fns |

### API Configuration

```
Base URL: https://asia-south1-labrand-ef645.cloudfunctions.net/api
Firebase Project: labrand-ef645
Supabase Project: uuirxtxqygpmqiunhkgs
```

---

## 📁 PROJECT STRUCTURE

```
/web
├── admin/                          # Admin Panel Application
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   │   ├── (auth)/             # Auth routes (login, forgot-password)
│   │   │   ├── (dashboard)/        # Protected dashboard routes
│   │   │   │   ├── layout.tsx      # Dashboard layout with sidebar
│   │   │   │   ├── page.tsx        # Dashboard home
│   │   │   │   ├── users/
│   │   │   │   ├── brands/
│   │   │   │   ├── categories/
│   │   │   │   ├── products/
│   │   │   │   ├── orders/
│   │   │   │   ├── reviews/
│   │   │   │   ├── analytics/
│   │   │   │   ├── promo-codes/
│   │   │   │   └── settings/
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/                 # Base UI components
│   │   │   ├── forms/              # Form components
│   │   │   ├── tables/             # Table components
│   │   │   ├── charts/             # Chart components
│   │   │   └── layouts/            # Layout components
│   │   ├── hooks/                  # Custom hooks
│   │   ├── lib/                    # Utilities
│   │   ├── services/               # API services
│   │   ├── stores/                 # Zustand stores
│   │   └── types/                  # TypeScript types
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── next.config.js
│
├── brand-portal/                   # Brand Portal Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx        # Dashboard home
│   │   │   │   ├── products/
│   │   │   │   ├── inventory/
│   │   │   │   ├── orders/
│   │   │   │   ├── reviews/
│   │   │   │   ├── analytics/
│   │   │   │   ├── branches/
│   │   │   │   └── profile/
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── services/
│   │   ├── stores/
│   │   └── types/
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── next.config.js
│
└── shared/                         # Shared code between projects
    ├── components/                 # Shared UI components
    ├── hooks/                      # Shared hooks
    ├── lib/                        # Shared utilities
    ├── services/                   # Shared API services
    └── types/                      # Shared TypeScript types
```

---

## 🎨 DESIGN SYSTEM

### Color Palette (Tailwind Config)

```typescript
// tailwind.config.ts
const colors = {
  // Primary Text
  text: {
    primary: '#1A1A1A',
    secondary: '#333333',
    tertiary: '#666666',
    muted: '#999999',
    inverted: '#FFFFFF',
  },
  // Backgrounds
  background: {
    primary: '#FAFAFA',
    surface: '#FFFFFF',
    secondary: '#F5F5F5',
    editorial: '#1A1A1A',
    dark: '#0D0D0D',
  },
  // Borders
  border: {
    primary: '#E8E8E8',
    subtle: '#F0F0F0',
    focus: '#1A1A1A',
  },
  // Accents
  accent: {
    gold: '#C4A77D',
    sale: '#C41E3A',
    success: '#2E7D32',
    error: '#C41E3A',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  // Button colors
  button: {
    primary: {
      bg: '#1A1A1A',
      text: '#FFFFFF',
    },
    secondary: {
      bg: '#FFFFFF',
      text: '#1A1A1A',
    },
  },
};
```

### Typography

```typescript
// Font families
const fontFamily = {
  serif: ['Georgia', 'Times New Roman', 'serif'],
  sans: ['system-ui', '-apple-system', 'sans-serif'],
};

// Font sizes (use Tailwind defaults with custom additions)
const fontSize = {
  'display-1': ['36px', { lineHeight: '1.2', letterSpacing: '0.02em' }],
  'display-2': ['24px', { lineHeight: '1.3', letterSpacing: '0.04em' }],
  'display-3': ['20px', { lineHeight: '1.4', letterSpacing: '0.02em' }],
  'heading': ['22px', { lineHeight: '1.4', letterSpacing: '0.06em' }],
  'body': ['15px', { lineHeight: '1.6' }],
  'caption': ['13px', { lineHeight: '1.5' }],
  'micro': ['10px', { lineHeight: '1.4', letterSpacing: '0.03em' }],
};
```

### Component Guidelines

1. **Buttons** - Rectangular (no rounded corners for luxury feel), or max `rounded-sm`
2. **Cards** - `rounded-lg` max, subtle borders (`border-border-primary`)
3. **Inputs** - Clean, minimal, focus states with `border-border-focus`
4. **Tables** - Clean grid lines, hover states
5. **Badges** - Pill shape for status, rectangular for categories
6. **Shadows** - Minimal use, prefer borders for elevation

---

## 📋 PHASE 1: PROJECT SETUP & SHARED INFRASTRUCTURE

### Tasks

- [ ] **1.1** Create `/web` directory structure
- [ ] **1.2** Initialize Admin Panel Next.js project
- [ ] **1.3** Initialize Brand Portal Next.js project
- [ ] **1.4** Create shared module structure
- [ ] **1.5** Configure Tailwind CSS with design system
- [ ] **1.6** Set up Firebase Auth integration
- [ ] **1.7** Create API client with Axios
- [ ] **1.8** Set up Zustand stores (auth, ui)
- [ ] **1.9** Create base UI components library
- [ ] **1.10** Implement authentication flow

### Shared Components to Create

```
/shared/components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Checkbox.tsx
│   ├── Radio.tsx
│   ├── Switch.tsx
│   ├── Badge.tsx
│   ├── Avatar.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Dropdown.tsx
│   ├── Tabs.tsx
│   ├── Toast.tsx
│   ├── Spinner.tsx
│   ├── Skeleton.tsx
│   ├── Pagination.tsx
│   └── index.ts
├── forms/
│   ├── FormField.tsx
│   ├── FormLabel.tsx
│   ├── FormError.tsx
│   ├── FormSection.tsx
│   └── index.ts
├── tables/
│   ├── DataTable.tsx
│   ├── TableHeader.tsx
│   ├── TableRow.tsx
│   ├── TableCell.tsx
│   ├── TablePagination.tsx
│   ├── TableFilters.tsx
│   └── index.ts
├── charts/
│   ├── LineChart.tsx
│   ├── BarChart.tsx
│   ├── PieChart.tsx
│   ├── AreaChart.tsx
│   └── index.ts
└── layouts/
    ├── Sidebar.tsx
    ├── Header.tsx
    ├── PageHeader.tsx
    ├── PageContent.tsx
    └── index.ts
```

### API Services Structure

```typescript
// /shared/services/api.ts
import axios from 'axios';
import { auth } from '@/lib/firebase';

const API_BASE_URL = 'https://asia-south1-labrand-ef645.cloudfunctions.net/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle errors
    throw error;
  }
);
```

### Authentication Store

```typescript
// /shared/stores/authStore.ts
import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AuthUser {
  id: string;
  email: string;
  role: 'client' | 'brand_manager' | 'admin' | 'root_admin';
  fullName: string;
  avatarUrl?: string;
  brandId?: string;
  branchId?: string;
}

interface AuthState {
  firebaseUser: User | null;
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setFirebaseUser: (user: User | null) => void;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ firebaseUser: null, user: null, isAuthenticated: false }),
}));
```

---

## 📋 PHASE 2: ADMIN PANEL - CORE MODULES

### 2.1 Dashboard Home

- [ ] Overview statistics cards (revenue, orders, customers, AOV)
- [ ] Revenue chart (line/area chart, 7d/30d/90d toggle)
- [ ] Orders by status (pie/donut chart)
- [ ] Top products table
- [ ] Top brands table
- [ ] Recent orders list
- [ ] Low stock alerts
- [ ] Quick actions

### 2.2 Users Module

**Pages:**
- [ ] `/users` - Users list with filters, search, pagination
- [ ] `/users/[id]` - User details with orders history
- [ ] `/users/[id]/edit` - Edit user (role, status)

**Features:**
- [ ] List all users with DataTable
- [ ] Filter by role, status, search
- [ ] Sort by created_at, name, email
- [ ] View user details (profile, addresses, orders, stats)
- [ ] Update user role (root_admin only)
- [ ] Deactivate/activate user
- [ ] Delete user (root_admin only)

**API Endpoints:**
```
GET    /users              - List users
GET    /users/:id          - Get user details
PATCH  /users/:id/role     - Update role
PATCH  /users/:id/deactivate - Deactivate
DELETE /users/:id          - Delete user
```

### 2.3 Brands Module

**Pages:**
- [ ] `/brands` - Brands list
- [ ] `/brands/new` - Create brand form
- [ ] `/brands/[id]` - Brand details
- [ ] `/brands/[id]/edit` - Edit brand
- [ ] `/brands/[id]/branches` - Brand branches
- [ ] `/brands/[id]/branches/new` - Create branch
- [ ] `/brands/[id]/branches/[branchId]` - Branch details

**Features:**
- [ ] List all brands with logo, stats
- [ ] Create new brand (name, slug, logo, description, website)
- [ ] Edit brand info
- [ ] View brand statistics
- [ ] Manage branches (CRUD)
- [ ] Assign managers to branches
- [ ] Toggle brand active status
- [ ] Delete brand (root_admin only)

**API Endpoints:**
```
GET    /brands                          - List brands
POST   /brands                          - Create brand
GET    /brands/:id                      - Get brand details
PUT    /brands/:id                      - Update brand
PATCH  /brands/:id/status               - Toggle status
DELETE /brands/:id                      - Delete brand
GET    /brands/:id/branches             - List branches
POST   /brands/:id/branches             - Create branch
PUT    /brands/:id/branches/:branchId   - Update branch
DELETE /brands/:id/branches/:branchId   - Delete branch
POST   /brands/:id/branches/:branchId/managers - Assign manager
```

### 2.4 Categories Module

**Pages:**
- [ ] `/categories` - Categories tree view
- [ ] `/categories/new` - Create category
- [ ] `/categories/[id]/edit` - Edit category

**Features:**
- [ ] Display categories as hierarchical tree
- [ ] Drag-and-drop reordering
- [ ] Create category (name, slug, parent, image, gender, position)
- [ ] Edit category
- [ ] Delete category (only if no products)
- [ ] View products count per category

**API Endpoints:**
```
GET    /categories         - Get category tree
GET    /categories/all     - Get flat list
POST   /categories         - Create category
PUT    /categories/:id     - Update category
PATCH  /categories/reorder - Reorder categories
DELETE /categories/:id     - Delete category
```

### 2.5 Products Module

**Pages:**
- [ ] `/products` - Products list with filters
- [ ] `/products/new` - Create product (multi-step form)
- [ ] `/products/[id]` - Product details
- [ ] `/products/[id]/edit` - Edit product
- [ ] `/products/[id]/variants` - Manage variants

**Features:**
- [ ] List products with images, brand, category, price, stock
- [ ] Filter by brand, category, status, price range, stock
- [ ] Search by name, SKU
- [ ] Create product with variants
- [ ] Image upload (multiple images, drag-drop ordering)
- [ ] Bulk status update
- [ ] Bulk delete (root_admin only)
- [ ] View/manage variants

**API Endpoints:**
```
GET    /products                        - List products
POST   /products                        - Create product
GET    /products/:id                    - Get product details
PUT    /products/:id                    - Update product
DELETE /products/:id                    - Delete product
PATCH  /products/bulk/status            - Bulk status update
DELETE /products/bulk                   - Bulk delete
```

### 2.6 Orders Module

**Pages:**
- [ ] `/orders` - Orders list with filters
- [ ] `/orders/[id]` - Order details

**Features:**
- [ ] List orders with status, customer, total, date
- [ ] Filter by status, date range, brand, customer
- [ ] View order details (items, customer, addresses, timeline)
- [ ] Update order status with notes
- [ ] Cancel order with refund option
- [ ] Print order/invoice

**Order Status Flow:**
```
pending → confirmed → processing → shipped → delivered
                  ↘ cancelled
                  ↘ refunded
```

**API Endpoints:**
```
GET    /orders              - List orders
GET    /orders/:id          - Get order details
PATCH  /orders/:id/status   - Update status
POST   /orders/:id/cancel   - Cancel order
```

### 2.7 Reviews Module

**Pages:**
- [ ] `/reviews` - Reviews list
- [ ] `/reviews/[id]` - Review details

**Features:**
- [ ] List reviews with product, rating, user, approval status
- [ ] Filter by product, brand, rating, approval status
- [ ] Approve/reject reviews
- [ ] Delete reviews
- [ ] View review images

**API Endpoints:**
```
GET    /reviews              - List reviews
PATCH  /reviews/:id/approve  - Approve/reject
DELETE /reviews/:id          - Delete review
```

### 2.8 Analytics Module

**Pages:**
- [ ] `/analytics` - Dashboard
- [ ] `/analytics/sales` - Sales reports
- [ ] `/analytics/inventory` - Inventory reports

**Features:**
- [ ] Dashboard with key metrics
- [ ] Revenue over time chart
- [ ] Orders by status chart
- [ ] Top products/brands tables
- [ ] Sales report with filters (date range, brand, category)
- [ ] Inventory report (stock levels, out of stock, low stock)
- [ ] Export to CSV/Excel

**API Endpoints:**
```
GET /analytics/dashboard  - Dashboard data
GET /analytics/sales      - Sales report
GET /analytics/inventory  - Inventory report
```

### 2.9 Promo Codes Module

**Pages:**
- [ ] `/promo-codes` - List promo codes
- [ ] `/promo-codes/new` - Create promo code
- [ ] `/promo-codes/[id]/edit` - Edit promo code

**Features:**
- [ ] List promo codes with usage stats
- [ ] Create promo code (code, type, value, limits, dates, restrictions)
- [ ] Edit promo code
- [ ] Deactivate promo code
- [ ] View usage history

**API Endpoints:**
```
GET    /promo-codes                - List promo codes
POST   /promo-codes                - Create promo code
PUT    /promo-codes/:id            - Update promo code
PATCH  /promo-codes/:id/deactivate - Deactivate
```

### 2.10 Settings Module (root_admin only)

**Pages:**
- [ ] `/settings` - General settings
- [ ] `/settings/shipping` - Shipping settings
- [ ] `/settings/payments` - Payment settings

**Features:**
- [ ] App name, support email, phone
- [ ] Free shipping threshold
- [ ] Default shipping cost
- [ ] Enabled payment methods

**API Endpoints:**
```
GET /settings     - Get settings
PUT /settings     - Update settings
```

---

## 📋 PHASE 3: BRAND PORTAL - CORE MODULES

### 3.1 Dashboard Home

- [ ] Brand overview stats
- [ ] Revenue chart (own brand)
- [ ] Orders by status
- [ ] Top products
- [ ] Inventory alerts
- [ ] Pending orders count
- [ ] Recent reviews

### 3.2 Products Module

**Pages:**
- [ ] `/products` - My products list
- [ ] `/products/new` - Create product
- [ ] `/products/[id]` - Product details
- [ ] `/products/[id]/edit` - Edit product
- [ ] `/products/[id]/variants` - Manage variants

**Features:**
- [ ] List own brand's products only
- [ ] Filter by branch, category, status, stock level
- [ ] Create product (branch_id required)
- [ ] Edit product
- [ ] Manage variants (sizes, colors, stock)
- [ ] Bulk create variants
- [ ] Image upload

**API Endpoints:**
```
GET    /brand/me/products                         - List products
POST   /brand/me/products                         - Create product
GET    /brand/me/products/:id                     - Get product
PUT    /brand/me/products/:id                     - Update product
DELETE /brand/me/products/:id                     - Delete product
PATCH  /brand/me/products/:id/status              - Update status
PATCH  /brand/me/products/bulk                    - Bulk update
GET    /brand/me/products/:id/variants            - List variants
POST   /brand/me/products/:id/variants            - Create variant
PUT    /brand/me/products/:id/variants/:variantId - Update variant
DELETE /brand/me/products/:id/variants/:variantId - Delete variant
POST   /brand/me/products/:id/variants/bulk       - Bulk create variants
```

### 3.3 Inventory Module

**Pages:**
- [ ] `/inventory` - Inventory overview
- [ ] `/inventory/history` - Stock change history

**Features:**
- [ ] Inventory summary (total, in stock, low stock, out of stock)
- [ ] Stock alerts list
- [ ] Update stock (single or bulk)
- [ ] Stock history with filters

**API Endpoints:**
```
GET   /brand/me/inventory           - Inventory overview
PATCH /brand/me/inventory/stock     - Update stock
PATCH /brand/me/inventory/stock/bulk - Bulk update
GET   /brand/me/inventory/history   - Stock history
```

### 3.4 Orders Module

**Pages:**
- [ ] `/orders` - My brand's orders
- [ ] `/orders/[id]` - Order details

**Features:**
- [ ] List orders containing my brand's products
- [ ] Filter by branch, status, date range
- [ ] View order details (only my items shown prominently)
- [ ] Update item status (pending → processing → ready → shipped)
- [ ] Mark items as ready for pickup

**API Endpoints:**
```
GET   /brand/me/orders                               - List orders
GET   /brand/me/orders/:id                           - Order details
PATCH /brand/me/orders/:orderId/items/:itemId/status - Update item status
POST  /brand/me/orders/:orderId/ready                - Mark items ready
```

### 3.5 Reviews Module

**Pages:**
- [ ] `/reviews` - Reviews for my products
- [ ] `/reviews/[id]` - Review detail with response

**Features:**
- [ ] List reviews for own products
- [ ] Filter by product, rating, responded status
- [ ] Respond to reviews
- [ ] Update responses

**API Endpoints:**
```
GET  /brand/me/reviews              - List reviews
POST /brand/me/reviews/:id/respond  - Respond to review
PUT  /brand/me/reviews/:id/respond  - Update response
```

### 3.6 Analytics Module

**Pages:**
- [ ] `/analytics` - Dashboard
- [ ] `/analytics/sales` - Sales reports
- [ ] `/analytics/products` - Products performance

**Features:**
- [ ] Brand-specific dashboard
- [ ] Revenue/orders charts
- [ ] Top products table
- [ ] Sales report (by period, category, product)
- [ ] Products performance (views, conversion, rating)
- [ ] Export reports

**API Endpoints:**
```
GET /brand/me/analytics/dashboard  - Dashboard
GET /brand/me/analytics/sales      - Sales report
GET /brand/me/analytics/products   - Products performance
GET /brand/me/analytics/export     - Export report
```

### 3.7 Branches Module

**Pages:**
- [ ] `/branches` - My branches list
- [ ] `/branches/[id]` - Branch details

**Features:**
- [ ] List branches (all if brand-level, only own if branch-level)
- [ ] View branch details and stats
- [ ] Update branch info (phone, hours, address)

**API Endpoints:**
```
GET /brand/me/branches            - List branches
GET /brand/me/branches/:branchId  - Branch details
PUT /brand/me/branches/:branchId  - Update branch
```

### 3.8 Profile Module

**Pages:**
- [ ] `/profile` - My profile
- [ ] `/profile/brand` - Brand info

**Features:**
- [ ] View/edit profile (name, phone, avatar)
- [ ] Change password
- [ ] View brand info
- [ ] Update brand description/logo (if permitted)

**API Endpoints:**
```
GET  /users/me                  - Get profile
PUT  /users/me                  - Update profile
POST /users/me/change-password  - Change password
GET  /brand/me                  - Get brand info
PUT  /brand/me                  - Update brand info
```

---

## 📋 PHASE 4: STOCK SYNC SERVICE (CRM INTEGRATION)

### Overview

The Stock Sync Service enables integration with various CRM/POS systems used by brand branches for real-time inventory synchronization.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         STOCK SYNC SERVICE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │  Billz Adapter  │  │   1C Adapter    │  │ Loyverse Adapter│  ...    │
│  │  (REST API)     │  │  (SOAP/File)    │  │   (REST API)    │         │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘         │
│           │                    │                    │                   │
│           └────────────────────┼────────────────────┘                   │
│                                │                                        │
│                    ┌───────────▼───────────┐                           │
│                    │      Normalizer       │                           │
│                    │  (Unified Stock Format)│                          │
│                    └───────────┬───────────┘                           │
│                                │                                        │
│                    ┌───────────▼───────────┐                           │
│                    │      Validator        │                           │
│                    │  (SKU matching, etc)  │                           │
│                    └───────────┬───────────┘                           │
│                                │                                        │
│                    ┌───────────▼───────────┐                           │
│                    │    Stock Service      │                           │
│                    │  (Update Supabase)    │                           │
│                    └───────────────────────┘                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Unified Stock Format

```typescript
interface UnifiedStockUpdate {
  branch_id: string;          // laBrand branch UUID
  product_id?: string;        // laBrand product UUID (if matched)
  sku: string;                // Product SKU
  external_id: string;        // ID in external CRM
  quantity: number;           // Current stock
  price?: number;             // Price (if syncing prices)
  last_updated: string;       // ISO timestamp
  source: string;             // CRM identifier
}
```

### Integration Types

#### Type A: REST API CRM (Billz, Loyverse, etc.)

```typescript
// Polling approach
interface APIAdapter {
  name: string;
  type: 'api';
  config: {
    baseUrl: string;
    apiKey: string;
    endpoints: {
      products: string;
      stock: string;
    };
    pollIntervalMinutes: number;
  };
  fetch(): Promise<ExternalProduct[]>;
  normalize(data: ExternalProduct[]): UnifiedStockUpdate[];
}
```

#### Type B: Webhook CRM

```typescript
// Webhook receiver
interface WebhookAdapter {
  name: string;
  type: 'webhook';
  config: {
    webhookPath: string;
    secretKey: string;
  };
  validate(payload: unknown): boolean;
  normalize(payload: unknown): UnifiedStockUpdate[];
}
```

#### Type C: File Export CRM (1C, Excel)

```typescript
// File import
interface FileAdapter {
  name: string;
  type: 'file';
  config: {
    source: 'ftp' | 'sftp' | 'email' | 'drive';
    connectionConfig: Record<string, string>;
    filePattern: string;
    pollIntervalMinutes: number;
  };
  fetchFile(): Promise<Buffer>;
  parseFile(buffer: Buffer): ExternalProduct[];
  normalize(data: ExternalProduct[]): UnifiedStockUpdate[];
}
```

### Admin Panel Features for Stock Sync

**Pages:**
- [ ] `/settings/integrations` - CRM integrations list
- [ ] `/settings/integrations/new` - Add new integration
- [ ] `/settings/integrations/[id]` - Integration details/config
- [ ] `/settings/integrations/[id]/logs` - Sync logs

**Features:**
- [ ] List all CRM integrations by brand/branch
- [ ] Configure new integration (select adapter type, enter credentials)
- [ ] Test connection
- [ ] View sync status and last sync time
- [ ] View sync logs/errors
- [ ] Manual sync trigger
- [ ] Enable/disable integration

### Brand Portal Features for Stock Sync

**Pages:**
- [ ] `/settings/integration` - My CRM integration

**Features:**
- [ ] View integration status
- [ ] Request integration setup
- [ ] View sync history
- [ ] Manual sync trigger (if permitted)

### Database Tables for Stock Sync

```sql
-- CRM Integrations
CREATE TABLE crm_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id),
  adapter_type VARCHAR(50) NOT NULL, -- 'billz', '1c', 'loyverse', 'csv', etc.
  config JSONB NOT NULL,             -- Encrypted credentials & settings
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  last_sync_status VARCHAR(20),      -- 'success', 'partial', 'failed'
  sync_interval_minutes INT DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync Logs
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES crm_integrations(id),
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL,       -- 'running', 'success', 'partial', 'failed'
  products_processed INT DEFAULT 0,
  products_updated INT DEFAULT 0,
  products_failed INT DEFAULT 0,
  errors JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SKU Mappings (for mapping external SKUs to our products)
CREATE TABLE sku_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES crm_integrations(id),
  external_sku VARCHAR(100) NOT NULL,
  product_variant_id UUID REFERENCES product_variants(id),
  is_auto_mapped BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(integration_id, external_sku)
);
```

---

## 📋 PHASE 5: POLISH & DEPLOYMENT

### Tasks

- [ ] **5.1** Responsive design testing
- [ ] **5.2** Dark mode support (optional)
- [ ] **5.3** Loading states and error boundaries
- [ ] **5.4** Toast notifications for actions
- [ ] **5.5** Keyboard navigation
- [ ] **5.6** Role-based route protection
- [ ] **5.7** API error handling and retry logic
- [ ] **5.8** Optimistic updates where appropriate
- [ ] **5.9** Image optimization
- [ ] **5.10** Bundle optimization
- [ ] **5.11** Deploy to Vercel/Firebase Hosting
- [ ] **5.12** Set up CI/CD pipeline
- [ ] **5.13** Environment configuration
- [ ] **5.14** Monitoring and analytics

---

## 🔧 IMPLEMENTATION GUIDELINES

### File Naming Conventions

```
Components: PascalCase.tsx (e.g., UserTable.tsx)
Hooks: useCamelCase.ts (e.g., useUsers.ts)
Services: camelCase.service.ts (e.g., users.service.ts)
Types: camelCase.types.ts (e.g., users.types.ts)
Stores: camelCase.store.ts (e.g., auth.store.ts)
Utils: camelCase.ts (e.g., formatDate.ts)
```

### Component Structure

```typescript
// Standard component structure
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Types
interface Props {
  // ...
}

// Component
export function ComponentName({ prop1, prop2 }: Props) {
  // Hooks
  const [state, setState] = useState();
  const { data, isLoading } = useQuery();

  // Handlers
  const handleClick = () => {};

  // Render
  if (isLoading) return <Skeleton />;

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### API Hook Pattern

```typescript
// Standard API hook with TanStack Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services/users.service';

export function useUsers(params?: UsersParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersService.getUsers(params),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => usersService.getUser(id),
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
      usersService.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', id] });
    },
  });
}
```

### Form Pattern

```typescript
// Standard form with React Hook Form + Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

type FormData = z.infer<typeof schema>;

export function UserForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
        label="Name"
        error={form.formState.errors.name?.message}
        {...form.register('name')}
      />
      {/* More fields */}
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

---

## ✅ COMPLETION CRITERIA

The project is complete when:

1. **Admin Panel:**
   - [ ] All CRUD operations work for users, brands, branches, categories, products, orders
   - [ ] Analytics dashboard displays correct data
   - [ ] Role-based access control works (admin vs root_admin)
   - [ ] Reviews moderation works
   - [ ] Promo codes management works
   - [ ] Settings management works (root_admin only)

2. **Brand Portal:**
   - [ ] Brand managers can only see their own brand's data
   - [ ] Product management (CRUD, variants, images) works
   - [ ] Inventory management and stock updates work
   - [ ] Order processing (status updates) works
   - [ ] Reviews responses work
   - [ ] Analytics shows brand-specific data
   - [ ] Branch-level access restrictions work

3. **Stock Sync (Phase 4):**
   - [ ] At least one adapter (Billz) is implemented
   - [ ] Integration configuration UI works
   - [ ] Sync logs are visible
   - [ ] Manual sync trigger works

4. **Quality:**
   - [ ] No TypeScript errors
   - [ ] No console errors
   - [ ] Responsive design works
   - [ ] Loading states are implemented
   - [ ] Error states are handled
   - [ ] Toast notifications work

When all criteria are met, output:

```
<promise>LABRAND WEB PLATFORM COMPLETE</promise>
```

---

## 🔗 REFERENCE DOCUMENTATION

- **API Admin Panel:** `/docs/API_ADMIN_PANEL.md`
- **API Brand Portal:** `/docs/API_BRAND_PORTAL.md`
- **API Overview:** `/docs/API_OVERVIEW.md`
- **API Client Mobile:** `/docs/API_CLIENT_MOBILE.md`
- **Firebase Console:** https://console.firebase.google.com/project/labrand-ef645
- **Supabase Dashboard:** https://supabase.com/dashboard/project/uuirxtxqygpmqiunhkgs

---

## 🚀 STARTING COMMAND

To start the Ralph loop for this project:

```bash
/ralph-loop "Implement the LaBrand Web Platform according to RALPH_TECHNICAL_PLAN.md. Start with Phase 1 (Project Setup), then proceed through each phase. Use Firebase MCP and Supabase MCP to verify data. Check your work after each major feature." --max-iterations 100 --completion-promise "LABRAND WEB PLATFORM COMPLETE"
```

