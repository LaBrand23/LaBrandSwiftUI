# Feature Plan: Branch-Based Products & Manual Order Creation

## Executive Summary

Two major features for the LaBrand platform:
1. **Branch-Based Product Management** - Products tied to specific branches with location-based inventory
2. **Manual Order Creation** - Brand managers create orders for walk-in/phone customers

---

## Part 1: Branch-Based Product Management

### 1.1 Business Requirements

#### Current State (Problems)
- Products are managed at brand level only (no branch association)
- All branches appear to have the same products
- Inventory cannot be tracked per branch location
- Different branches may carry different product selections
- No way to manage branch-specific stock levels

#### Business Goals
1. Products assigned to specific branches during creation
2. Each branch maintains its own inventory levels
3. Brand managers MUST select branch when creating products
4. Stock management is branch-aware
5. Orders fulfill from specific branches

### 1.2 Technical Design

#### Current Data Model
```
Brand (1) ──── (N) Branch     [EXISTS - but disconnected]
Brand (1) ──── (N) Product    [EXISTS - no branch link]
Product (1) ── (N) Variant    [EXISTS - variant-level stock only]
```

#### Proposed Data Model
```
Brand (1) ──── (N) Branch
Brand (1) ──── (N) Product
Product (1) ── (N) BranchInventory ── (N) Branch
Variant (1) ── (N) BranchVariantStock ── (N) Branch
```

#### New Database Tables

```sql
-- Branch-level product inventory
CREATE TABLE branch_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  stock_quantity INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  is_available BOOLEAN DEFAULT true,
  price_override DECIMAL(10,2),  -- Optional branch-specific pricing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(branch_id, product_id)
);

-- Branch-level variant stock
CREATE TABLE branch_variant_stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  stock_quantity INT DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(branch_id, variant_id)
);

-- Stock transfer between branches
CREATE TABLE stock_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_branch_id UUID NOT NULL REFERENCES branches(id),
  to_branch_id UUID NOT NULL REFERENCES branches(id),
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_branch_inventory_branch ON branch_inventory(branch_id);
CREATE INDEX idx_branch_inventory_product ON branch_inventory(product_id);
CREATE INDEX idx_branch_variant_stock_branch ON branch_variant_stock(branch_id);
```

#### Modified Tables

```sql
-- Products: Add primary branch
ALTER TABLE products ADD COLUMN primary_branch_id UUID REFERENCES branches(id);

-- Orders: Add fulfillment branch
ALTER TABLE orders ADD COLUMN fulfillment_branch_id UUID REFERENCES branches(id);

-- Order Items: Track source branch
ALTER TABLE order_items ADD COLUMN branch_id UUID REFERENCES branches(id);
```

#### Backend Changes

**New Service: `branch-inventory.service.ts`**
```typescript
class BranchInventoryService {
  // Get branch inventory
  async getBranchInventory(branchId: string, query): Promise<BranchInventory[]>

  // Add product to branch
  async addProductToBranch(branchId: string, productId: string, stock: number): Promise<void>

  // Update branch stock
  async updateBranchStock(branchId: string, productId: string, quantity: number): Promise<void>

  // Transfer stock between branches
  async createTransfer(from: string, to: string, productId: string, qty: number): Promise<Transfer>

  // Complete transfer
  async completeTransfer(transferId: string): Promise<void>
}
```

**New Endpoints:**
```
GET    /inventory/branch/:branchId           # Get branch inventory
POST   /inventory/branch/:branchId/products  # Add product to branch
PATCH  /inventory/branch/:branchId/products/:productId  # Update stock
GET    /inventory/transfers                  # List transfers
POST   /inventory/transfers                  # Create transfer
PATCH  /inventory/transfers/:id/complete     # Complete transfer
```

**Modified Endpoints:**
```
POST /products  # Now requires branch_id in body
GET  /products?branch_id=xxx  # Filter by branch
POST /inventory/adjust  # Now requires branch_id
```

#### Frontend Changes

**Product Creation (`/products/new/page.tsx`):**
- Add required branch selector BEFORE other fields
- Validate branch selection
- Show only products from selected branch in inventory

**Inventory Page (`/inventory/page.tsx`):**
- Add branch filter dropdown
- Show branch-level stock
- Add "Transfer Stock" button

**New Page: `/inventory/transfers`**
- List pending/completed transfers
- Create new transfer form

---

## Part 2: Manual Order Creation

### 2.1 Business Requirements

#### Use Cases
1. Customer calls store to place order
2. Customer visits store, wants delivery
3. Brand wants to use platform's delivery system
4. Customer should track order via mobile app with phone number

#### Business Goals
1. Brand managers create orders on behalf of customers
2. Orders linked to customer phone number
3. Customers track orders via mobile app (no account needed)
4. Same order workflow as regular orders
5. Support guest customers (phone + name only)

### 2.2 Technical Design

#### Database Changes

```sql
-- Order source tracking
ALTER TABLE orders ADD COLUMN source VARCHAR(20) DEFAULT 'app';
-- Values: 'app', 'web', 'manual', 'pos'

-- Guest order support
ALTER TABLE orders ADD COLUMN is_guest_order BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN guest_phone VARCHAR(20);
ALTER TABLE orders ADD COLUMN guest_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN created_by_user_id UUID REFERENCES users(id);

-- Tracking tokens for guest orders
CREATE TABLE order_tracking_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  token VARCHAR(64) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_guest_phone ON orders(guest_phone);
CREATE INDEX idx_orders_source ON orders(source);
CREATE INDEX idx_tracking_tokens_phone ON order_tracking_tokens(phone);
```

#### Backend Changes

**New Service: `manual-orders.service.ts`**
```typescript
class ManualOrdersService {
  // Create manual order
  async createManualOrder(
    createdBy: string,
    branchId: string,
    customer: { type: 'existing' | 'guest', userId?: string, phone: string, name: string },
    items: OrderItem[],
    shippingAddress: Address,
    paymentMethod: string
  ): Promise<{ order: Order, trackingUrl: string, trackingCode: string }>

  // Lookup customer by phone
  async lookupCustomer(phone: string): Promise<Customer | null>

  // Get orders by phone (public)
  async getOrdersByPhone(phone: string): Promise<Order[]>

  // Get order by tracking code (public)
  async getOrderByTrackingCode(code: string): Promise<Order>
}
```

**New Endpoints:**
```
# Manual order creation (Brand Manager)
POST /orders/manual
Body: {
  branch_id: string,
  customer: {
    type: 'existing' | 'guest',
    user_id?: string,
    phone: string,
    name: string,
    email?: string
  },
  items: [{ product_id, variant_id?, quantity }],
  shipping_address: Address,
  payment_method: 'cash_on_delivery' | 'prepaid',
  notes?: string
}
Response: {
  order: Order,
  tracking_url: string,
  tracking_code: string
}

# Customer lookup (Brand Manager)
GET /orders/manual/customer-lookup?phone=998901234567

# Public order tracking by phone
GET /orders/track?phone=998901234567

# Public order tracking by code
GET /orders/track/:trackingCode
```

**Modified Endpoints:**
```
GET /orders?source=manual  # Filter by source
```

#### Frontend Changes

**New Page: `/orders/create` (Manual Order Creation)**

```
┌──────────────────────────────────────────────────────────┐
│  Create Manual Order                                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  STEP 1: Customer                                        │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Phone: [+998 90 123 4567     ] [Search]            │ │
│  │                                                     │ │
│  │ ○ Existing: John Doe (5 orders)                    │ │
│  │ ● Guest Customer                                    │ │
│  │   Name: [_____________________]                     │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  STEP 2: Branch                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Fulfillment Branch: [Downtown Store ▼]             │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  STEP 3: Products                                        │
│  ┌────────────────────────────────────────────────────┐ │
│  │ [Search products...            ] [+ Add]           │ │
│  │                                                     │ │
│  │ ┌──────────────────────────────────────────────┐  │ │
│  │ │ Product Name    Size: M   Qty: [2]     $50   │  │ │
│  │ │ Stock: 15                         [Remove]   │  │ │
│  │ └──────────────────────────────────────────────┘  │ │
│  │                                                     │ │
│  │ Subtotal: $100  |  Shipping: $5  |  Total: $105   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  STEP 4: Delivery                                        │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Address: [_________________________________]       │ │
│  │ City: [__________]  Postal: [______]              │ │
│  │ Payment: ○ Cash on Delivery  ○ Prepaid            │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│                    [Create Order & Send Tracking SMS]    │
└──────────────────────────────────────────────────────────┘
```

**Orders Page Updates:**
- Add "Create Manual Order" button
- Add source filter dropdown
- Show source badge on order cards

#### Mobile App Changes

**Phone-Based Order Tracking (No Login):**
```
┌─────────────────────────────────┐
│      Track Your Order           │
│                                 │
│  Phone: [+998 90 123 4567  ]   │
│         [Track Orders]          │
│                                 │
│  ───────────────────────────    │
│                                 │
│  Order #ORD-12345               │
│  Status: 🚚 Out for Delivery    │
│  Total: $105.00                 │
│  ETA: Today 3:00 PM             │
│                      [View →]   │
└─────────────────────────────────┘
```

---

## Part 3: Implementation Phases

### Phase 1: Database Setup (3 days)
1. Create new tables in Supabase
2. Add columns to existing tables
3. Create indexes
4. Set up RLS policies

### Phase 2: Backend - Branch Inventory (4 days)
1. Create BranchInventoryService
2. Create branch inventory endpoints
3. Modify product creation to require branch
4. Update inventory endpoints

### Phase 3: Backend - Manual Orders (4 days)
1. Create ManualOrdersService
2. Create manual order endpoints
3. Create tracking endpoints (public)
4. Add order source tracking

### Phase 4: Frontend - Branch Features (5 days)
1. Update product creation form
2. Add branch filter to inventory
3. Create stock transfer page

### Phase 5: Frontend - Manual Orders (5 days)
1. Create manual order page
2. Customer lookup component
3. Product selector with branch filter
4. Update orders page

### Phase 6: Mobile - Order Tracking (3 days)
1. Phone-based tracking screen
2. Guest order support
3. Push notifications for manual orders

### Phase 7: Testing & Deployment (3 days)
1. Integration testing
2. User acceptance testing
3. Documentation
4. Deployment

**Total Estimated Time: 4 weeks**

---

## Part 4: Files to Create/Modify

### Backend (functions/src/)
```
CREATE:
- modules/branch-inventory/branch-inventory.service.ts
- modules/branch-inventory/branch-inventory.controller.ts
- modules/manual-orders/manual-orders.service.ts
- modules/manual-orders/manual-orders.controller.ts

MODIFY:
- modules/products/products.service.ts (add branch_id)
- modules/products/products.controller.ts (require branch_id)
- modules/inventory/inventory.service.ts (branch-aware)
- modules/orders/orders.service.ts (source tracking)
- index.ts (register new routes)
- types/index.ts (new types)
```

### Frontend (web/brand-portal/)
```
CREATE:
- src/app/(dashboard)/orders/create/page.tsx
- src/app/(dashboard)/inventory/transfers/page.tsx
- src/components/BranchSelector.tsx
- src/components/CustomerLookup.tsx
- src/components/ProductSelector.tsx

MODIFY:
- src/app/(dashboard)/products/new/page.tsx (branch selection)
- src/app/(dashboard)/inventory/page.tsx (branch filter)
- src/app/(dashboard)/orders/page.tsx (source filter, create button)
```

### Shared (web/shared/)
```
MODIFY:
- types/index.ts (BranchInventory, ManualOrder types)
- services/inventory.service.ts (branch methods)
- services/orders.service.ts (manual order methods)

CREATE:
- services/branch-inventory.service.ts
- services/manual-orders.service.ts
```

---

## Part 5: Success Metrics

| Metric | Target |
|--------|--------|
| Products assigned to branches | 100% |
| Stock accuracy per branch | > 95% |
| Manual order creation time | < 3 min |
| Guest tracking success rate | > 90% |
| Page load times | < 2s |

---

## Part 6: Open Questions/Answers

1. Should products be allowed in multiple branches? - YES
2. Should we support branch-specific pricing? - NO
3. SMS provider for tracking notifications? - NOT NOW, WILL BE ADDED LATER
4. Should stock transfers require approval? - MAYBE
5. Minimum order amount for manual orders? - 1 (Manuall order for normal users who want to buy clothes or comaes from social network ad of some brand and ask if they have delivery)
