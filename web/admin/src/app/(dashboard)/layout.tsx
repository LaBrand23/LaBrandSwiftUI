'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderTree,
  Package,
  ShoppingCart,
  Star,
  BarChart3,
  Ticket,
  Settings,
  Bell,
} from 'lucide-react';
import { Sidebar, NavGroup } from '../../../../shared/components/layouts/Sidebar';
import { Header } from '../../../../shared/components/layouts/Header';
import { useUIStore } from '../../../../shared/stores/uiStore';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { PageLoader } from '../../../../shared/components/ui/Spinner';
// ErrorBoundary temporarily removed due to type mismatch - TODO: fix types
import { cn } from '../../../../shared/lib/utils';

const navigation: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Users', href: '/users', icon: Users },
      { label: 'Brands', href: '/brands', icon: Building2 },
      { label: 'Categories', href: '/categories', icon: FolderTree },
      { label: 'Products', href: '/products', icon: Package },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Orders', href: '/orders', icon: ShoppingCart },
      { label: 'Reviews', href: '/reviews', icon: Star },
    ],
  },
  {
    label: 'Reports',
    items: [
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
      { label: 'Notifications', href: '/notifications', icon: Bell },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Promo Codes', href: '/promo-codes', icon: Ticket },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isLoading, isAuthenticated, user } = useAuth({
    requiredRoles: ['admin', 'root_admin'],
    redirectTo: '/login',
  });
  const { sidebarCollapsed } = useUIStore();

  if (isLoading) {
    return <PageLoader message="Loading..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Sidebar */}
      <Sidebar
        logo={
          <Link href="/" className="flex items-center gap-2">
            <span className={cn(
              'font-serif text-xl font-semibold text-text-primary',
              sidebarCollapsed && 'hidden'
            )}>
              LaBrand
            </span>
            {sidebarCollapsed && (
              <span className="font-serif text-xl font-semibold text-text-primary">
                LB
              </span>
            )}
          </Link>
        }
        navigation={navigation}
        footer={
          !sidebarCollapsed && (
            <div className="text-xs text-text-muted">
              <p>{user?.role === 'root_admin' ? 'Root Admin' : 'Admin'}</p>
              <p className="truncate">{user?.email}</p>
            </div>
          )
        }
      />

      {/* Main content */}
      <div
        className={cn(
          'transition-all duration-200',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
