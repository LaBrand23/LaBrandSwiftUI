import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface UIState {
  // Sidebar state
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Modal state
  activeModal: string | null;
  modalData: unknown;

  // Toast notifications
  toasts: Toast[];

  // Theme (for future dark mode)
  theme: 'light' | 'dark';

  // Loading overlay
  globalLoading: boolean;
  loadingMessage: string | null;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  openModal: (modalId: string, data?: unknown) => void;
  closeModal: () => void;

  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  setGlobalLoading: (loading: boolean, message?: string) => void;
}

// Generate unique ID for toasts
const generateId = () => Math.random().toString(36).substring(2, 9);

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarOpen: true,
      sidebarCollapsed: false,
      activeModal: null,
      modalData: null,
      toasts: [],
      theme: 'light',
      globalLoading: false,
      loadingMessage: null,

      // Sidebar actions
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (sidebarOpen) => {
        set({ sidebarOpen });
      },

      toggleSidebarCollapsed: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setSidebarCollapsed: (sidebarCollapsed) => {
        set({ sidebarCollapsed });
      },

      // Modal actions
      openModal: (modalId, data = null) => {
        set({ activeModal: modalId, modalData: data });
      },

      closeModal: () => {
        set({ activeModal: null, modalData: null });
      },

      // Toast actions
      addToast: (toast) => {
        const id = generateId();
        const newToast: Toast = {
          ...toast,
          id,
          duration: toast.duration ?? 5000,
        };

        set((state) => ({
          toasts: [...state.toasts, newToast],
        }));

        // Auto-remove toast after duration
        if (newToast.duration && newToast.duration > 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, newToast.duration);
        }
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
      },

      clearToasts: () => {
        set({ toasts: [] });
      },

      // Theme actions
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      // Global loading actions
      setGlobalLoading: (globalLoading, loadingMessage = null) => {
        set({ globalLoading, loadingMessage });
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        // Only persist preferences
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);

// Helper functions for showing toasts
export const toast = {
  success: (title: string, message?: string) => {
    useUIStore.getState().addToast({ type: 'success', title, message });
  },
  error: (title: string, message?: string) => {
    useUIStore.getState().addToast({ type: 'error', title, message });
  },
  warning: (title: string, message?: string) => {
    useUIStore.getState().addToast({ type: 'warning', title, message });
  },
  info: (title: string, message?: string) => {
    useUIStore.getState().addToast({ type: 'info', title, message });
  },
};
