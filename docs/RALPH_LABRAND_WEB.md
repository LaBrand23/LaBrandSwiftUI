# LaBrand Web Platform - Complete Implementation Plan

**For Use With:** Claude Code + Ralph Loop Plugin
**Completion Promise:** `<promise>LABRAND WEB IMPLEMENTATION COMPLETE</promise>`

---

## PROJECT OVERVIEW

Fix bugs, remove mocks, connect Admin and Brand portals, implement planned features for LaBrand web platform.

### Platform Components

| Component | Path | Status |
|-----------|------|--------|
| **Admin Panel** | `web/admin/` | 96% - bugs to fix |
| **Brand Portal** | `web/brand-portal/` | 95% - bugs to fix |
| **Shared Library** | `web/shared/` | 90% - missing exports |
| **Documentation** | `docs/` | Reference only |

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14.2.35 (App Router) |
| **Language** | TypeScript 5 (strict mode) |
| **State** | Zustand 5.0.9 + TanStack React Query 5.x |
| **Forms** | React Hook Form 7.70 + Zod 4.3.5 |
| **Styling** | Tailwind CSS + CVA |
| **Auth** | Firebase 12.7.0 |
| **HTTP** | Axios 1.13.2 |

### Key Files Reference

| Component | Path |
|-----------|------|
| API Client | `web/shared/lib/api.ts` |
| Auth Hook | `web/shared/hooks/useAuth.tsx` |
| Auth Store | `web/shared/stores/authStore.ts` |
| Services | `web/shared/services/` |
| Types | `web/shared/types/index.ts` |
| UI Components | `web/shared/components/ui/` |

---

## PHASE 1: CRITICAL FIXES

### Tasks

- [ ] **1.1** Delete duplicate files:
  - `web/admin/src/app/(dashboard)/products/[id]/edit/page 2.tsx`
  - `web/brand-portal/src/app/(dashboard)/branches/page 2.tsx`
  - `web/brand-portal/src/app/(dashboard)/products/[id]/page 2.tsx`

- [ ] **1.2** Export missing services in `web/shared/services/index.ts`:
  ```typescript
  // ADD these exports:
  export * from './notifications.service';
  export * from './branch-inventory.service';
  ```

- [ ] **1.3** Remove console statements from `web/shared/lib/api.ts`:
  - Line 20: `console.log('[API] Request interceptor...')`
  - Line 23: `console.warn('[API] No current user...')`
  - Line 26: `console.log('[API] Got token...')`
  - Line 42: `console.log('[API] Response interceptor...')`
  - Line 46: `console.error('[API] Error getting auth token...')`

- [ ] **1.4** Remove console statements from `web/shared/hooks/useAuth.tsx`:
  - Line 33: `console.log('[Auth] Setting up...')`
  - Line 51: `console.log('[Auth] Firebase user...')`
  - Line 56: `console.log('[Auth] Fetching API profile...')`
  - Line 59: `console.log('[Auth] API profile fetched...')`
  - Line 74: `console.warn('[Auth] API profile fetch failed...')`
  - Line 76: `console.log('[Auth] User logged out...')`
  - Line 89: `console.log('[Auth] Auth timeout...')`
  - Line 98: `console.log('[Auth] Cleanup...')`

- [ ] **1.5** Remove console from `web/admin/src/app/(auth)/login/page.tsx`:
  - Line 68: `console.error('Login error:', error)`

- [ ] **1.6** Remove console from `web/admin/src/app/(dashboard)/analytics/page.tsx`:
  - Line 280: `console.error('Export failed:', error)`

- [ ] **1.7** Remove console from `web/brand-portal/src/app/(auth)/login/page.tsx`:
  - Line 46: `console.error('[Login] Error:', err)`

- [ ] **1.8** Remove console from `web/brand-portal/src/app/(dashboard)/layout.tsx`:
  - Line 49: `console.error('[Dashboard] Auth failed:', error)`

- [ ] **1.9** Fix dashboard stats bug in `web/brand-portal/src/app/(dashboard)/page.tsx`:
  ```typescript
  // Line 108 - WRONG:
  value={dashboardData?.inventory_alerts?.out_of_stock ? 0 : 0}

  // CORRECT:
  value={dashboardData?.top_products?.length || 0}
  ```

- [ ] **1.10** Stage and commit Badge.tsx changes in `web/shared/components/ui/Badge.tsx`

### Verification

```bash
# After Phase 1, run:
cd web/admin && npm run build
cd web/brand-portal && npm run build

# Should see:
# - No TypeScript errors
# - No console.log in terminal output
# - Build succeeds
```

---

## PHASE 2: CONFIGURATION & CLEANUP

### Tasks

- [ ] **2.1** Move API URL to environment variable in `web/shared/lib/api.ts`:
  ```typescript
  // BEFORE:
  const API_BASE_URL = 'https://asia-south1-labrand-ef645.cloudfunctions.net/api';

  // AFTER:
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  ```

- [ ] **2.2** Create `.env.local` in `web/admin/`:
  ```env
  NEXT_PUBLIC_API_URL=https://asia-south1-labrand-ef645.cloudfunctions.net/api
  ```

- [ ] **2.3** Create `.env.local` in `web/brand-portal/`:
  ```env
  NEXT_PUBLIC_API_URL=https://asia-south1-labrand-ef645.cloudfunctions.net/api
  ```

- [ ] **2.4** Export UnauthorizedPage from `web/shared/components/auth/index.ts`:
  ```typescript
  export { AuthGuard, AdminGuard, RootAdminGuard, BrandGuard, withAuth } from './AuthGuard';
  export { UnauthorizedPage } from './UnauthorizedPage';  // ADD THIS
  ```

- [ ] **2.5** Consolidate duplicate `withAuth` HOC:
  - Keep implementation in `web/shared/components/auth/AuthGuard.tsx`
  - Remove from `web/shared/hooks/useAuth.tsx`
  - Update `web/shared/hooks/index.ts` to not export withAuth

- [ ] **2.6** Handle empty directories - add placeholders:
  - Create `web/shared/components/charts/index.ts`:
    ```typescript
    // Chart components - TODO: Implement recharts wrappers
    export {};
    ```
  - Create `web/shared/components/tables/index.ts`:
    ```typescript
    // Table components - TODO: Implement data table
    export {};
    ```

- [ ] **2.7** Replace mock fallback in `web/admin/src/app/(dashboard)/page.tsx`:
  ```typescript
  // BEFORE (lines 40-68): Silent mock fallback
  const dashboardData = data || { overview: { ... } };

  // AFTER: Show error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Failed to load dashboard data</p>
        <Button onClick={() => refetch()} className="mt-4">Retry</Button>
      </div>
    );
  }

  if (!data) {
    return <DashboardSkeleton />;
  }
  ```

### Verification

```bash
# Test env vars work:
cd web/admin && npm run dev
# Check network tab - API calls go to correct URL

cd web/brand-portal && npm run dev
# Check network tab - API calls go to correct URL
```

---

## PHASE 3: CODE QUALITY

### Tasks

- [ ] **3.1** Extract StatCard to shared component:
  - Create `web/shared/components/ui/StatCard.tsx`:
    ```typescript
    interface StatCardProps {
      title: string;
      value: string | number;
      change?: number;
      changeLabel?: string;
      icon?: React.ReactNode;
      trend?: 'up' | 'down' | 'neutral';
    }

    export function StatCard({ title, value, change, changeLabel, icon, trend }: StatCardProps) {
      // Implementation from existing inline components
    }
    ```
  - Export from `web/shared/components/ui/index.ts`
  - Update imports in:
    - `web/admin/src/app/(dashboard)/page.tsx`
    - `web/brand-portal/src/app/(dashboard)/page.tsx`
    - `web/brand-portal/src/app/(dashboard)/analytics/page.tsx`

- [ ] **3.2** Extract StarRating to shared component:
  - Create `web/shared/components/ui/StarRating.tsx`
  - Move from `web/brand-portal/src/app/(dashboard)/reviews/page.tsx`
  - Export from index
  - Update imports

- [ ] **3.3** Extract ProductCard to shared component:
  - Create `web/shared/components/ui/ProductCard.tsx`
  - Move from `web/brand-portal/src/app/(dashboard)/products/page.tsx`
  - Export from index
  - Update imports

- [ ] **3.4** Fix type assertions in product pages:
  - Update `web/shared/types/index.ts` - ensure Product.images is `string[]`
  - Remove type casts like `(product.images as string[])`
  - Files to check:
    - `web/brand-portal/src/app/(dashboard)/products/[id]/page.tsx`
    - `web/brand-portal/src/app/(dashboard)/products/[id]/edit/page.tsx`
    - `web/brand-portal/src/app/(dashboard)/inventory/page.tsx`

- [ ] **3.5** Add error boundaries to dashboard layouts:
  - Update `web/admin/src/app/(dashboard)/layout.tsx`:
    ```typescript
    import { ErrorBoundary } from '@shared/components/ui/ErrorBoundary';

    export default function DashboardLayout({ children }) {
      return (
        <ErrorBoundary>
          <Sidebar />
          <main>{children}</main>
        </ErrorBoundary>
      );
    }
    ```
  - Update `web/brand-portal/src/app/(dashboard)/layout.tsx` similarly

### Verification

```bash
# Build both projects
cd web/admin && npm run build
cd web/brand-portal && npm run build

# Check shared exports
grep -r "StatCard" web/admin/src
grep -r "StatCard" web/brand-portal/src
# Should import from @shared/components/ui
```

---

## PHASE 4: ADMIN FEATURE COMPLETION

### Tasks

- [ ] **4.1** Create admin notifications page `web/admin/src/app/(dashboard)/notifications/page.tsx`:
  ```typescript
  'use client';

  // Features:
  // - Send notification to all users
  // - Send to specific segment
  // - Send to individual user
  // - View sent notification history
  // - Use notificationsService from @shared
  ```

- [ ] **4.2** Add review response to admin reviews page:
  - Update `web/admin/src/app/(dashboard)/reviews/page.tsx`
  - Add response modal (same as brand portal)
  - Use `reviewsService.respondToReview()`

- [ ] **4.3** Add user delete functionality:
  - Update `web/admin/src/app/(dashboard)/users/[id]/page.tsx`
  - Add delete button (root_admin only)
  - Use `usersService.deleteUser()`
  - Add confirmation modal

- [ ] **4.4** Add product tags management:
  - Create `web/admin/src/app/(dashboard)/tags/page.tsx`
  - CRUD operations for tags
  - Tag assignment in product forms

- [ ] **4.5** Update admin sidebar navigation:
  - Add "Notifications" link
  - Add "Tags" link under Products section

### API Endpoints Reference

```
POST /admin/notifications/send - Send notification
GET  /admin/notifications      - List sent notifications
DELETE /admin/users/:id        - Delete user (root_admin)
POST /admin/tags               - Create tag
GET  /admin/tags               - List tags
PUT  /admin/tags/:id           - Update tag
DELETE /admin/tags/:id         - Delete tag
```

### Verification

```bash
# Test admin features
cd web/admin && npm run dev

# Verify:
# 1. Notifications page loads at /notifications
# 2. Reviews page has respond button
# 3. User detail page has delete button (as root_admin)
# 4. Tags page loads at /tags
```

---

## PHASE 5: BRANCH-BASED PRODUCTS

### Database Changes Required (Backend)

```sql
-- New table: branch_inventory
CREATE TABLE branch_inventory (
  id UUID PRIMARY KEY,
  branch_id UUID REFERENCES branches(id),
  product_id UUID REFERENCES products(id),
  stock_quantity INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  is_available BOOLEAN DEFAULT true,
  UNIQUE(branch_id, product_id)
);

-- New table: stock_transfers
CREATE TABLE stock_transfers (
  id UUID PRIMARY KEY,
  from_branch_id UUID REFERENCES branches(id),
  to_branch_id UUID REFERENCES branches(id),
  product_id UUID REFERENCES products(id),
  quantity INT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modify products table
ALTER TABLE products ADD COLUMN primary_branch_id UUID;
```

### Frontend Tasks

- [ ] **5.1** Update product creation form in `web/brand-portal/src/app/(dashboard)/products/new/page.tsx`:
  - Add required branch selector at top of form
  - Fetch branches from `brandsService.getBrandBranches()`
  - Include `branch_id` in create request

- [ ] **5.2** Update inventory page in `web/brand-portal/src/app/(dashboard)/inventory/page.tsx`:
  - Add branch filter dropdown
  - Show branch-specific stock levels
  - Use `branchInventoryService` (now exported)

- [ ] **5.3** Create stock transfers page `web/brand-portal/src/app/(dashboard)/inventory/transfers/page.tsx`:
  ```typescript
  'use client';

  // Features:
  // - List pending/completed transfers
  // - Create new transfer (from branch, to branch, product, quantity)
  // - Complete/cancel transfer
  ```

- [ ] **5.4** Create branch selector component `web/brand-portal/src/components/BranchSelector.tsx`:
  ```typescript
  interface BranchSelectorProps {
    value: string;
    onChange: (branchId: string) => void;
    required?: boolean;
  }
  ```

- [ ] **5.5** Update `web/shared/services/branch-inventory.service.ts`:
  - Ensure all methods work:
    - `getBranchInventory(branchId)`
    - `updateBranchStock(branchId, productId, quantity)`
    - `createTransfer(fromBranch, toBranch, productId, qty)`
    - `completeTransfer(transferId)`

- [ ] **5.6** Update brand portal sidebar:
  - Add "Stock Transfers" link under Inventory section

### Verification

```bash
# Test branch products
cd web/brand-portal && npm run dev

# Verify:
# 1. Product creation requires branch selection
# 2. Inventory shows branch filter
# 3. Stock transfers page works at /inventory/transfers
```

---

## PHASE 6: MANUAL ORDER CREATION

### Database Changes Required (Backend)

```sql
-- Modify orders table
ALTER TABLE orders ADD COLUMN source VARCHAR(20) DEFAULT 'app';
ALTER TABLE orders ADD COLUMN is_guest_order BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN guest_phone VARCHAR(20);
ALTER TABLE orders ADD COLUMN guest_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN created_by_user_id UUID;

-- New table: order_tracking_tokens
CREATE TABLE order_tracking_tokens (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  token VARCHAR(64) UNIQUE,
  phone VARCHAR(20),
  expires_at TIMESTAMPTZ
);
```

### Frontend Tasks

- [ ] **6.1** Create manual order page `web/brand-portal/src/app/(dashboard)/orders/create/page.tsx`:
  ```typescript
  'use client';

  // Step 1: Customer lookup/entry
  // - Phone number input with search
  // - Existing customer or guest toggle
  // - Guest name input

  // Step 2: Branch selection
  // - Fulfillment branch dropdown

  // Step 3: Product selection
  // - Search products
  // - Select variant
  // - Set quantity
  // - Show subtotal

  // Step 4: Delivery details
  // - Shipping address form
  // - Payment method (COD/prepaid)

  // Submit: Create order & show tracking code
  ```

- [ ] **6.2** Create customer lookup component `web/brand-portal/src/components/CustomerLookup.tsx`:
  ```typescript
  interface CustomerLookupProps {
    onSelect: (customer: Customer | GuestCustomer) => void;
  }

  // Features:
  // - Phone input with country code
  // - Search existing customers
  // - Toggle to create guest
  // - Guest name input
  ```

- [ ] **6.3** Create product selector component `web/brand-portal/src/components/ProductSelector.tsx`:
  ```typescript
  interface ProductSelectorProps {
    branchId: string;
    onAdd: (item: OrderItem) => void;
  }

  // Features:
  // - Search products by name/SKU
  // - Filter by branch stock
  // - Select variant (size/color)
  // - Quantity input
  // - Show available stock
  ```

- [ ] **6.4** Create manual order service `web/shared/services/manual-orders.service.ts`:
  ```typescript
  export const manualOrdersService = {
    // Create manual order
    createManualOrder(data: CreateManualOrderData): Promise<ManualOrderResponse>,

    // Lookup customer by phone
    lookupCustomer(phone: string): Promise<Customer | null>,

    // Get orders by phone (public)
    getOrdersByPhone(phone: string): Promise<Order[]>,
  };
  ```

- [ ] **6.5** Update orders page `web/brand-portal/src/app/(dashboard)/orders/page.tsx`:
  - Add "Create Manual Order" button
  - Add source filter dropdown (app, web, manual, pos)
  - Show source badge on order cards

- [ ] **6.6** Add types in `web/shared/types/index.ts`:
  ```typescript
  export interface ManualOrderData {
    branch_id: string;
    customer: {
      type: 'existing' | 'guest';
      user_id?: string;
      phone: string;
      name: string;
    };
    items: Array<{
      product_id: string;
      variant_id?: string;
      quantity: number;
    }>;
    shipping_address: Address;
    payment_method: 'cash_on_delivery' | 'prepaid';
  }

  export type OrderSource = 'app' | 'web' | 'manual' | 'pos';
  ```

### Verification

```bash
# Test manual orders
cd web/brand-portal && npm run dev

# Verify:
# 1. "Create Manual Order" button on orders page
# 2. Order creation flow works (4 steps)
# 3. Source filter shows on orders list
# 4. Created order appears in list with "manual" badge
```

---

## PHASE 7: TESTING & POLISH

### Tasks

- [ ] **7.1** Test all admin pages load without errors
- [ ] **7.2** Test all brand portal pages load without errors
- [ ] **7.3** Test authentication flow (login → dashboard)
- [ ] **7.4** Test product CRUD in brand portal
- [ ] **7.5** Test order status updates
- [ ] **7.6** Test inventory management
- [ ] **7.7** Test branch products feature
- [ ] **7.8** Test manual order creation
- [ ] **7.9** Verify no console.log in browser
- [ ] **7.10** Verify all API calls succeed (check network tab)
- [ ] **7.11** Run TypeScript check:
  ```bash
  cd web/admin && npx tsc --noEmit
  cd web/brand-portal && npx tsc --noEmit
  ```
- [ ] **7.12** Run ESLint:
  ```bash
  cd web/admin && npm run lint
  cd web/brand-portal && npm run lint
  ```

### Manual Test Checklist

| Test | Admin | Brand | Expected |
|------|-------|-------|----------|
| Login | /login | /login | Redirects to dashboard |
| Dashboard loads | / | / | Shows real data |
| Products list | /products | /products | Shows products |
| Create product | /products/new | /products/new | Product created |
| Edit product | /products/[id]/edit | /products/[id]/edit | Product updated |
| Orders list | /orders | /orders | Shows orders |
| Update order | /orders/[id] | /orders/[id] | Status changes |
| Users list | /users | N/A | Shows users |
| Brands list | /brands | N/A | Shows brands |
| Categories | /categories | N/A | Tree works |
| Reviews | /reviews | /reviews | List loads |
| Analytics | /analytics | /analytics | Charts render |
| Inventory | /inventory | /inventory | Stock shows |
| Settings | /settings | /settings/integration | Saves |
| Notifications | /notifications | /notifications | Loads |

---

## COMPLETION CRITERIA

The project is complete when:

### Phase 1 - Critical Fixes
- [ ] All 3 duplicate files deleted
- [ ] Both missing services exported
- [ ] All 17 console statements removed
- [ ] Dashboard stats bug fixed
- [ ] Badge.tsx committed

### Phase 2 - Configuration
- [ ] API URL in environment variables
- [ ] .env.local files created
- [ ] UnauthorizedPage exported
- [ ] withAuth HOC consolidated
- [ ] Empty directories have placeholders
- [ ] Mock fallback replaced with error UI

### Phase 3 - Code Quality
- [ ] StatCard extracted to shared
- [ ] StarRating extracted to shared
- [ ] ProductCard extracted to shared
- [ ] Type assertions removed
- [ ] Error boundaries added

### Phase 4 - Admin Features
- [ ] Notifications page implemented
- [ ] Review response works
- [ ] User delete works (root_admin)
- [ ] Tags management implemented

### Phase 5 - Branch Products
- [ ] Branch selector in product form
- [ ] Branch filter in inventory
- [ ] Stock transfers page works

### Phase 6 - Manual Orders
- [ ] Manual order page implemented
- [ ] Customer lookup works
- [ ] Product selector works
- [ ] Source filter on orders

### Phase 7 - Quality
- [ ] All pages load without errors
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] No console.log in browser
- [ ] All API calls succeed

When all criteria are met, output:

```
<promise>LABRAND WEB IMPLEMENTATION COMPLETE</promise>
```

---

## EXECUTION ORDER

1. **Phase 1** - Fix critical bugs first (blocking issues)
2. **Phase 2** - Configuration and cleanup
3. **Phase 3** - Code quality improvements
4. **Phase 4** - Admin feature completion
5. **Phase 5** - Branch-based products (if backend ready)
6. **Phase 6** - Manual order creation (if backend ready)
7. **Phase 7** - Testing and polish

**Note:** Phases 5-6 require backend database changes. If backend not ready, mark those phases as "BLOCKED - waiting for backend" and complete other phases first.

---

## FILE REFERENCE

### Files to DELETE

```
web/admin/src/app/(dashboard)/products/[id]/edit/page 2.tsx
web/brand-portal/src/app/(dashboard)/branches/page 2.tsx
web/brand-portal/src/app/(dashboard)/products/[id]/page 2.tsx
```

### Files to MODIFY (Priority)

```
1. web/shared/services/index.ts
2. web/shared/lib/api.ts
3. web/shared/hooks/useAuth.tsx
4. web/shared/hooks/index.ts
5. web/shared/components/auth/index.ts
6. web/admin/src/app/(auth)/login/page.tsx
7. web/admin/src/app/(dashboard)/page.tsx
8. web/admin/src/app/(dashboard)/analytics/page.tsx
9. web/brand-portal/src/app/(auth)/login/page.tsx
10. web/brand-portal/src/app/(dashboard)/page.tsx
11. web/brand-portal/src/app/(dashboard)/layout.tsx
```

### Files to CREATE

```
web/admin/.env.local
web/brand-portal/.env.local
web/shared/components/ui/StatCard.tsx
web/shared/components/ui/StarRating.tsx
web/shared/components/ui/ProductCard.tsx
web/shared/components/charts/index.ts
web/shared/components/tables/index.ts
web/admin/src/app/(dashboard)/notifications/page.tsx
web/admin/src/app/(dashboard)/tags/page.tsx
web/brand-portal/src/app/(dashboard)/orders/create/page.tsx
web/brand-portal/src/app/(dashboard)/inventory/transfers/page.tsx
web/brand-portal/src/components/BranchSelector.tsx
web/brand-portal/src/components/CustomerLookup.tsx
web/brand-portal/src/components/ProductSelector.tsx
web/shared/services/manual-orders.service.ts
```

---

## QUICK START COMMAND

```bash
/ralph-loop "Implement LaBrand web according to docs/RALPH_LABRAND_WEB.md. Start with Phase 1 (Critical Fixes), then proceed through each phase. Verify each phase works before moving to next. Use real APIs (no mocks). Test thoroughly." --max-iterations 100 --completion-promise "LABRAND WEB IMPLEMENTATION COMPLETE"
```

---

## SUCCESS METRICS

| Metric | Target |
|--------|--------|
| Console.log statements | 0 |
| Duplicate files | 0 |
| Missing exports | 0 |
| TypeScript errors | 0 |
| ESLint errors | 0 |
| Mock data usage | 0 |
| Page load time | < 2s |
| API response time | < 500ms |
| Build time | < 60s |

---

## NOTES

### API Base URL

Production: `https://asia-south1-labrand-ef645.cloudfunctions.net/api`

### Role Requirements

| Action | Required Role |
|--------|---------------|
| Admin Panel access | admin, root_admin |
| Brand Portal access | brand_manager |
| Delete users | root_admin |
| System settings | root_admin |

### App Group (Shared Library)

Both admin and brand-portal import from `@shared` which maps to `web/shared/`

### Git Workflow

After each phase:
```bash
git add .
git commit -m "Phase X: [description]"
```
