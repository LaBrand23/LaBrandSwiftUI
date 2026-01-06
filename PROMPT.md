# LaBrand Web Platform Development

**Completion Promise:** `<promise>LABRAND WEB PLATFORM COMPLETE</promise>`

## Your Mission

Build two production-ready web applications for LaBrand fashion e-commerce:

1. **Admin Panel** (`/web/admin`) - For platform administrators
2. **Brand Portal** (`/web/brand-portal`) - For brand managers

## Reference Documents

- **Full Technical Plan:** `RALPH_TECHNICAL_PLAN.md` (READ THIS FIRST)
- **API Documentation:**
  - `/docs/API_ADMIN_PANEL.md` - Admin API endpoints
  - `/docs/API_BRAND_PORTAL.md` - Brand Portal API endpoints
  - `/docs/API_OVERVIEW.md` - Architecture overview

## Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS (custom design system in plan)
- **State:** Zustand + TanStack Query
- **Auth:** Firebase Auth
- **API:** Axios to `https://asia-south1-labrand-ef645.cloudfunctions.net/api`

## Available Tools

You have access to **Firebase MCP** and **Supabase MCP** to:
- Verify Firebase project configuration
- Check Supabase tables and data
- Test API responses

## Progress Tracking

Check your progress against `RALPH_TECHNICAL_PLAN.md`:
- [ ] Phase 1: Project Setup & Shared Infrastructure
- [ ] Phase 2: Admin Panel - Core Modules
- [ ] Phase 3: Brand Portal - Core Modules
- [ ] Phase 4: Stock Sync Service (CRM Integration)
- [ ] Phase 5: Polish & Deployment

## Current Iteration Instructions

1. **Check existing work** - Review what's already built in `/web` directory
2. **Identify next task** - Look at the phase checklists in the technical plan
3. **Implement** - Build the next feature/module
4. **Verify** - Test that it works with the API
5. **Commit** - Make logical git commits for your work

## Key Design Requirements

```
Colors:
- Primary: #1A1A1A (text/buttons)
- Background: #FAFAFA (off-white, never pure white)
- Accent Gold: #C4A77D (premium highlights only)
- Accent Red: #C41E3A (sales/errors only)
- Borders: #E8E8E8

Typography:
- Headlines: Georgia (serif)
- Body: System font (San Francisco)
- Button text: Semibold, uppercase, tracked

Styling:
- Minimal rounded corners (max rounded-lg)
- Subtle borders over shadows
- Clean, luxury aesthetic
```

## API Configuration

```typescript
const API_BASE_URL = 'https://asia-south1-labrand-ef645.cloudfunctions.net/api';

// All authenticated requests need:
// Authorization: Bearer <firebase_id_token>

// Roles:
// - root_admin: Full access
// - admin: Most admin features, no delete/role management
// - brand_manager: Only own brand's resources
```

## When You're Done

When ALL features in the technical plan are complete and working:

```
<promise>LABRAND WEB PLATFORM COMPLETE</promise>
```

---

**START NOW:** Read `RALPH_TECHNICAL_PLAN.md` and begin with Phase 1 if not started, or continue from where the previous iteration left off.

