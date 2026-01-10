'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuthStore } from '@shared/stores/authStore';
import { useUIStore } from '@shared/stores/uiStore';
import { authService } from '@shared/services/auth.service';
import { auth } from '@shared/lib/firebase';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Spinner } from '@shared/components/ui/Spinner';

// #region agent log
const debugLog = (location: string, message: string, data: Record<string, unknown>, hypothesisId: string) => {
  fetch('http://127.0.0.1:7245/ingest/4a9f2cb7-5fe2-4950-ae6d-4e9c7208ed6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location,message,data,timestamp:Date.now(),sessionId:'debug-session',runId:'dashboard-debug',hypothesisId})}).catch(()=>{});
};
// #endregion

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, setUser, setLoading } = useAuthStore();
  const { isSidebarOpen } = useUIStore();
  const authCallbackCount = useRef(0);

  // #region agent log
  debugLog('dashboard/layout.tsx:mount', 'DashboardLayout mounting', { userEmail: user?.email || 'null', isLoading, authReady: !!auth }, 'A');
  // #endregion

  useEffect(() => {
    console.log('[Dashboard] Layout effect, user:', user?.email);
    // #region agent log
    debugLog('dashboard/layout.tsx:useEffect:start', 'useEffect triggered', { userEmail: user?.email || 'null', isLoading, authReady: !!auth }, 'A');
    // #endregion

    if (user) {
      console.log('[Dashboard] User in store, skip auth check');
      // #region agent log
      debugLog('dashboard/layout.tsx:useEffect:user-exists', 'User already in store, skipping', { userEmail: user.email }, 'E');
      // #endregion
      setLoading(false);
      return;
    }

    console.log('[Dashboard] No user, setting up listener');
    // #region agent log
    debugLog('dashboard/layout.tsx:useEffect:setup-listener', 'Setting up onAuthStateChanged', { authReady: !!auth, currentUser: auth?.currentUser?.uid || 'null' }, 'A');
    // #endregion
    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      authCallbackCount.current += 1;
      const callbackNum = authCallbackCount.current;
      console.log('[Dashboard] Auth changed, uid:', firebaseUser?.uid);
      // #region agent log
      debugLog('dashboard/layout.tsx:onAuthStateChanged', 'Auth state callback fired', { uid: firebaseUser?.uid || 'null', callbackNum, hasUser: !!firebaseUser }, 'B');
      // #endregion

      if (!firebaseUser) {
        console.log('[Dashboard] No firebase user, redirect to login');
        // #region agent log
        debugLog('dashboard/layout.tsx:onAuthStateChanged:no-user', 'No firebase user - redirecting to login', { callbackNum }, 'B');
        // #endregion
        setLoading(false);
        router.replace('/login');
        return;
      }

      try {
        console.log('[Dashboard] Getting user from API');
        // #region agent log
        debugLog('dashboard/layout.tsx:onAuthStateChanged:api-call', 'About to call authService.getMe()', { uid: firebaseUser.uid, currentUser: auth?.currentUser?.uid || 'null' }, 'C');
        // #endregion
        const currentUser = await authService.getMe();
        console.log('[Dashboard] Got user:', currentUser.email);
        // #region agent log
        debugLog('dashboard/layout.tsx:onAuthStateChanged:api-success', 'Got user from API', { email: currentUser.email, role: currentUser.role }, 'C');
        // #endregion

        if (currentUser.role !== 'brand_manager') {
          console.log('[Dashboard] Not brand_manager, logout');
          // #region agent log
          debugLog('dashboard/layout.tsx:onAuthStateChanged:wrong-role', 'User is not brand_manager', { role: currentUser.role }, 'C');
          // #endregion
          await authService.logout();
          router.replace('/login');
          return;
        }

        console.log('[Dashboard] Setting user');
        // #region agent log
        debugLog('dashboard/layout.tsx:onAuthStateChanged:set-user', 'Setting user in store', { email: currentUser.email }, 'E');
        // #endregion
        setUser(currentUser);
      } catch (error: any) {
        console.error('[Dashboard] Auth failed:', error);
        // #region agent log
        debugLog('dashboard/layout.tsx:onAuthStateChanged:error', 'API call failed', { error: error?.message || String(error), status: error?.status }, 'C');
        // #endregion
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user, router, setUser, setLoading]);

  console.log('[Dashboard] Render, loading:', isLoading, 'user:', user?.email);
  // #region agent log
  debugLog('dashboard/layout.tsx:render', 'Rendering dashboard', { isLoading, userEmail: user?.email || 'null' }, 'B');
  // #endregion

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
