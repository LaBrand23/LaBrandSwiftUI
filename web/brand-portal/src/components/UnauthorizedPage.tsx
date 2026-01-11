'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@shared/stores/authStore';
import { Button } from '@shared/components/ui/Button';
import { Card } from '@shared/components/ui/Card';
import { ShieldExclamationIcon, ArrowLeftIcon, HomeIcon } from '@heroicons/react/24/outline';

export function UnauthorizedPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleLogout = async () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-error-100 flex items-center justify-center mx-auto mb-6">
            <ShieldExclamationIcon className="w-8 h-8 text-error-600" />
          </div>

          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
            Access Denied
          </h1>

          <p className="text-neutral-500 mb-6">
            You don&apos;t have permission to access this page. Please contact your
            administrator if you believe this is an error.
          </p>

          {user && (
            <div className="p-4 bg-neutral-100 rounded-lg mb-6">
              <p className="text-sm text-neutral-600">
                Signed in as: <span className="font-medium">{user.email}</span>
              </p>
              <p className="text-sm text-neutral-500">
                Role: <span className="font-medium capitalize">{user.role.replace('_', ' ')}</span>
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button onClick={handleGoHome} className="w-full">
              <HomeIcon className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>

            <Button variant="outline" onClick={handleGoBack} className="w-full">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Go Back
            </Button>

            <Button variant="ghost" onClick={handleLogout} className="w-full text-error-600">
              Sign Out
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default UnauthorizedPage;
