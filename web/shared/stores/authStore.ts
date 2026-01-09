import { create } from 'zustand';
import { User } from 'firebase/auth';
import { AuthUser, UserRole } from '../types';

interface AuthState {
  // Firebase user
  firebaseUser: User | null;
  // App user with role and brand info
  user: AuthUser | null;
  // Loading state - true until Firebase auth state is determined
  isLoading: boolean;
  // Auth status
  isAuthenticated: boolean;
  // Error message
  error: string | null;

  // Actions
  setFirebaseUser: (user: User | null) => void;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;

  // Helpers
  hasRole: (role: UserRole | UserRole[]) => boolean;
  isAdmin: () => boolean;
  isRootAdmin: () => boolean;
  isBrandManager: () => boolean;
  canAccessAdminPanel: () => boolean;
  canAccessBrandPortal: () => boolean;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  firebaseUser: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  setFirebaseUser: (firebaseUser) => {
    set({ firebaseUser });
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      error: null,
    });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error, isLoading: false });
  },

  logout: () => {
    set({
      firebaseUser: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  hasRole: (role) => {
    const { user } = get();
    if (!user) return false;

    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  },

  isAdmin: () => {
    const { user } = get();
    return user?.role === 'admin' || user?.role === 'root_admin';
  },

  isRootAdmin: () => {
    const { user } = get();
    return user?.role === 'root_admin';
  },

  isBrandManager: () => {
    const { user } = get();
    return user?.role === 'brand_manager';
  },

  canAccessAdminPanel: () => {
    const { user } = get();
    return user?.role === 'admin' || user?.role === 'root_admin';
  },

  canAccessBrandPortal: () => {
    const { user } = get();
    return user?.role === 'brand_manager';
  },
}));

// Selectors for easier usage
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
