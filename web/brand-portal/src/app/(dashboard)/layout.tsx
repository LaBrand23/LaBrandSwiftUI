'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@shared/stores/authStore';
import { useUIStore } from '@shared/stores/uiStore';
import { authService } from '@shared/services/auth.service';
import { auth } from '@shared/lib/firebase';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Spinner } from '@shared/components/ui/Spinner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, setUser, setLoading } = useAuthStore();
  const { isSidebarOpen } = useUIStore();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        // Wait for Firebase auth to be ready
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          router.push('/login');
          return;
        }

        // Get user profile from API
        const currentUser = await authService.getMe();

        // Check if user has brand_manager role
        if (currentUser.role !== 'brand_manager') {
          await authService.logout();
          router.push('/login');
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, setUser, setLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
