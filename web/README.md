# LaBrand Web Platform

A comprehensive web platform for managing the LaBrand fashion e-commerce ecosystem, built with Next.js 14, React 18, and TypeScript.

## Architecture

```
web/
├── admin/           # Admin Panel (port 3000)
├── brand-portal/    # Brand Manager Portal (port 3001)
└── shared/          # Shared code between apps
    ├── components/  # Reusable UI components
    ├── lib/         # Utilities, API client, Firebase config
    ├── services/    # API service modules
    ├── stores/      # Zustand state stores
    └── types/       # TypeScript type definitions
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand (global), TanStack Query (server state)
- **Authentication**: Firebase Auth with role-based access
- **API Client**: Axios with auth interceptor
- **Form Handling**: React Hook Form + Zod validation
- **Icons**: Heroicons

## Applications

### Admin Panel (`/admin`)

Full platform management for administrators.

**Features:**
- Dashboard with analytics overview
- User management (CRUD, role assignment)
- Brand management with branches
- Product catalog management
- Order processing and tracking
- Category hierarchy management
- Review moderation
- Inventory & stock sync management
- Platform settings

**Access Roles:** `admin`, `root_admin`

### Brand Portal (`/brand-portal`)

Self-service portal for brand managers.

**Features:**
- Brand-specific dashboard
- Product management for their brand
- Inventory tracking and adjustments
- Order fulfillment
- Review responses
- Analytics for their brand
- Branch management
- Profile settings

**Access Role:** `brand_manager`

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project with Authentication enabled

### Environment Variables

Create `.env.local` in each app directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://asia-south1-labrand-ef645.cloudfunctions.net/api
```

### Installation

```bash
# Install dependencies for Admin Panel
cd web/admin
npm install

# Install dependencies for Brand Portal
cd ../brand-portal
npm install
```

### Development

```bash
# Start Admin Panel (http://localhost:3000)
cd web/admin
npm run dev

# Start Brand Portal (http://localhost:3001)
cd web/brand-portal
npm run dev
```

### Build for Production

```bash
# Build Admin Panel
cd web/admin
npm run build

# Build Brand Portal
cd web/brand-portal
npm run build
```

## API Integration

The platform connects to the LaBrand API:
- Base URL: `https://asia-south1-labrand-ef645.cloudfunctions.net/api`
- Authentication: Firebase JWT tokens
- All requests include `Authorization: Bearer <token>` header

### Services

| Service | Description |
|---------|-------------|
| `authService` | Authentication and session management |
| `usersService` | User CRUD operations |
| `brandsService` | Brand and branch management |
| `productsService` | Product catalog operations |
| `ordersService` | Order processing |
| `categoriesService` | Category hierarchy |
| `reviewsService` | Review moderation |
| `analyticsService` | Dashboard and reports |
| `settingsService` | Platform configuration |
| `inventoryService` | Stock sync and management |

## Shared Components

### UI Components

- `Button` - Primary, secondary, outline, ghost, danger variants
- `Input` - Text inputs with label and validation
- `Select` - Dropdown select with options
- `Badge` - Status indicators with color variants
- `Card` - Container with shadow and border
- `Modal` - Dialog overlay with animations
- `Spinner` - Loading indicator
- `Avatar` - User profile images
- `Toast` - Notification system
- `Tabs` - Tab navigation
- `Pagination` - Page navigation
- `Dropdown` - Action menus

### Layouts

- `Sidebar` - Navigation sidebar with collapsible state
- `Header` - Top bar with user menu
- `PageHeader` - Page title with actions

## Currency & Localization

- Currency: Uzbek Som (UZS)
- Format: `1,234,500 UZS`
- Date format: `Jan 6, 2024`

## Role-Based Access

| Role | Admin Panel | Brand Portal |
|------|-------------|--------------|
| `root_admin` | Full access | - |
| `admin` | Full access | - |
| `brand_manager` | - | Brand-specific access |
| `client` | - | - |

## Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Set environment variables
3. Deploy each app separately:
   - Admin: Root directory `web/admin`
   - Brand Portal: Root directory `web/brand-portal`

### Docker

```dockerfile
# Example Dockerfile for Admin Panel
FROM node:18-alpine
WORKDIR /app
COPY web/admin/package*.json ./
RUN npm ci
COPY web/admin .
COPY web/shared ../shared
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## License

Proprietary - LaBrand © 2024
