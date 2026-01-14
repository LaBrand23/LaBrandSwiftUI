'use client';

import { useState } from 'react';
import { signIn, signOut } from '@shared/lib/firebase';
import { authService } from '@shared/services/auth.service';
import { useAuthStore } from '@shared/stores/authStore';
import { toast } from '@shared/stores/uiStore';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';

export default function LoginPage() {
  const { setUser } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Sign in with Firebase
      await signIn(email, password);

      // Verify user has brand_manager role before navigating
      const user = await authService.getMe();

      if (user.role !== 'brand_manager') {
        await signOut();
        setError('This portal is only for brand managers. Please contact support.');
        setIsLoading(false);
        return;
      }

      // Set user in auth store before navigation
      setUser(user);

      toast.success('Welcome back!');

      // Navigate to dashboard
      window.location.href = '/';
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid email or password';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-hard p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-xl mb-4">
              <span className="text-2xl font-bold text-primary-600">LB</span>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">Brand Portal</h1>
            <p className="text-neutral-500 mt-2">Sign in to manage your brand</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
              <p className="text-sm text-error-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="you@brand.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-500">
              Need access?{' '}
              <a
                href="mailto:support@labrand.uz"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Contact support
              </a>
            </p>
          </div>
        </div>

        <p className="text-center text-neutral-400 text-sm mt-6">
          &copy; 2024 LaBrand. All rights reserved.
        </p>
      </div>
    </div>
  );
}
