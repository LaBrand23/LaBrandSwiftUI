'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuthStore } from '@shared/stores/authStore';
import { useUIStore } from '@shared/stores/uiStore';
import { authService } from '@shared/services/auth.service';
import { auth } from '@shared/lib/firebase';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Spinner } from '@shared/components/ui/Spinner';
import { ErrorBoundary } from '@shared/components/ui/ErrorBoundary';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, setUser, setLoading } = useAuthStore();
  const { sidebarCollapsed } = useUIStore();

  useEffect(() => {
    if (user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setLoading(false);
        router.replace('/login');
        return;
      }

      try {
        const currentUser = await authService.getMe();

        if (currentUser.role !== 'brand_manager') {
          await authService.logout();
          router.replace('/login');
          return;
        }

        setUser(currentUser);
      } catch {
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user, router, setUser, setLoading]);

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
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <Header />
        <main className="p-6">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
