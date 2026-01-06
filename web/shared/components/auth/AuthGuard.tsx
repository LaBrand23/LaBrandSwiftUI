'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@shared/stores/authStore';
import { UserRole } from '@shared/types';
import Spinner from '@shared/components/ui/Spinner';

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  requireAuth?: boolean;
  fallback?: ReactNode;
}

export function AuthGuard({
  children,
  allowedRoles,
  redirectTo = '/login',
  requireAuth = true,
  fallback,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, hasRole } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    // Check authentication
    if (requireAuth && !isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`${redirectTo}?returnUrl=${returnUrl}`);
      return;
    }

    // Check role authorization
    if (isAuthenticated && allowedRoles && allowedRoles.length > 0) {
      if (!hasRole(allowedRoles)) {
        router.replace('/unauthorized');
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, redirectTo, router, pathname, hasRole]);

  // Show loading state
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-neutral-500">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-neutral-500">Redirecting to login...</p>
          </div>
        </div>
      )
    );
  }

  // Not authorized for role
  if (isAuthenticated && allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-neutral-500">Access denied...</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: Omit<AuthGuardProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <WrappedComponent {...props} />
      </AuthGuard>
    );
  };
}

// Pre-configured guards for Admin Panel
export function AdminGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard
      allowedRoles={['admin', 'root_admin']}
      redirectTo="/login"
    >
      {children}
    </AuthGuard>
  );
}

// Pre-configured guard for Root Admin only
export function RootAdminGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard
      allowedRoles={['root_admin']}
      redirectTo="/login"
    >
      {children}
    </AuthGuard>
  );
}

// Pre-configured guard for Brand Portal
export function BrandGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard
      allowedRoles={['brand_manager']}
      redirectTo="/login"
    >
      {children}
    </AuthGuard>
  );
}

export default AuthGuard;
