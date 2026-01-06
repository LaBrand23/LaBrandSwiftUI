'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '../../../../../shared/components/ui/Button';
import { FormInput } from '../../../../../shared/components/forms/FormField';
import { signIn } from '../../../../../shared/lib/firebase';
import { authService } from '../../../../../shared/services/auth.service';
import { useAuthStore } from '../../../../../shared/stores/authStore';
import { toast } from '../../../../../shared/stores/uiStore';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setFirebaseUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      // Sign in with Firebase
      const firebaseUser = await signIn(data.email, data.password);
      setFirebaseUser(firebaseUser);

      // Get user profile from API
      const userData = await authService.getMe();

      // Check if user has admin access
      if (userData.role !== 'admin' && userData.role !== 'root_admin') {
        toast.error('Access denied', 'You do not have permission to access the admin panel');
        setIsLoading(false);
        return;
      }

      setUser(userData);
      toast.success('Welcome back!', `Logged in as ${userData.full_name}`);
      router.push('/');
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Invalid email or password';
      toast.error('Login failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-display-1 font-serif text-text-primary">
            LaBrand
          </h1>
          <p className="text-text-tertiary mt-2">Admin Panel</p>
        </div>

        {/* Login form */}
        <div className="bg-background-surface rounded-lg border border-border-primary p-8">
          <h2 className="text-xl font-semibold text-text-primary mb-6">
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormInput
              label="Email"
              type="email"
              placeholder="admin@labrand.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="relative">
              <FormInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-text-muted hover:text-text-secondary"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border-primary"
                />
                <span className="text-sm text-text-secondary">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-text-secondary hover:text-text-primary"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              leftIcon={<LogIn className="h-5 w-5" />}
            >
              Sign in
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-text-muted mt-6">
          © 2026 LaBrand. All rights reserved.
        </p>
      </div>
    </div>
  );
}
