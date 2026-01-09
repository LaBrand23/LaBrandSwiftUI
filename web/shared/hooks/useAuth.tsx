'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthChange, signIn, signOut } from '../lib/firebase';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/auth.service';
import { toast } from '../stores/uiStore';
import { UserRole } from '../types';

interface UseAuthOptions {
  requiredRoles?: UserRole[];
  redirectTo?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { requiredRoles, redirectTo = '/login' } = options;
  const router = useRouter();
  const pathname = usePathname();
  const initRef = useRef(false);

  const store = useAuthStore();
  const { user, firebaseUser, isLoading, isAuthenticated } = store;

  // Listen to Firebase auth state changes
  useEffect(() => {
    // Prevent multiple subscriptions
    if (initRef.current) return;
    initRef.current = true;

    const unsubscribe = onAuthChange(async (fbUser) => {
      store.setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          // Fetch user data from API
          const userData = await authService.getMe();
          store.setUser(userData);

          // Check role access
          if (requiredRoles?.length && !requiredRoles.includes(userData.role)) {
            router.replace('/unauthorized');
            return;
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          store.setError('Failed to load user profile');
          await signOut();
          store.logout();
        }
      } else {
        // No Firebase user - logout
        store.logout();
        if (!pathname.includes('/login') && !pathname.includes('/forgot-password')) {
          router.replace(redirectTo);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    store.setLoading(true);
    store.setError(null);

    try {
      await signIn(email, password);
      // onAuthChange will handle setting the user
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      store.setError(errorMessage);
      toast.error('Login failed', errorMessage);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut();
      store.logout();
      router.replace(redirectTo);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    user,
    firebaseUser,
    isLoading,
    isAuthenticated,
    login,
    logout,
    hasRole: store.hasRole,
    isAdmin: store.isAdmin,
    isRootAdmin: store.isRootAdmin,
    isBrandManager: store.isBrandManager,
  };
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: UseAuthOptions = {}
) {
  return function ProtectedRoute(props: P) {
    const { isLoading, isAuthenticated } = useAuth(options);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background-primary">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-border-primary border-t-text-primary" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
