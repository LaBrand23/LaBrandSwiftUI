'use client';

import { useEffect, useState } from 'react';
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
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    user,
    firebaseUser,
    isLoading,
    isAuthenticated,
    setFirebaseUser,
    setUser,
    setLoading,
    setError,
    logout: storeLogout,
    hasRole,
    isAdmin,
    isRootAdmin,
    isBrandManager,
  } = useAuthStore();

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Fetch user profile from API
          const userData = await authService.getMe();
          setUser(userData);

          // Check role access
          if (requiredRoles && requiredRoles.length > 0) {
            if (!requiredRoles.includes(userData.role)) {
              // Redirect based on role
              if (userData.role === 'brand_manager') {
                router.replace('/');
              } else if (userData.role === 'admin' || userData.role === 'root_admin') {
                router.replace('/');
              } else {
                router.replace(redirectTo);
              }
              return;
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setError('Failed to load user profile');
          await signOut();
          storeLogout();
        }
      } else {
        storeLogout();
        // Redirect to login if on protected route
        if (!pathname.includes('/login') && !pathname.includes('/forgot-password')) {
          router.replace(redirectTo);
        }
      }

      setIsInitialized(true);
    });

    return () => unsubscribe();
  }, [pathname, redirectTo, requiredRoles, router, setError, setFirebaseUser, setUser, storeLogout]);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      await signIn(email, password);
      // Auth state listener will handle the rest
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      toast.error('Login failed', errorMessage);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut();
      storeLogout();
      router.replace(redirectTo);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    user,
    firebaseUser,
    isLoading: !isInitialized || isLoading,
    isAuthenticated,
    login,
    logout,
    hasRole,
    isAdmin,
    isRootAdmin,
    isBrandManager,
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
      return null; // Will redirect in useAuth
    }

    return <WrappedComponent {...props} />;
  };
}
