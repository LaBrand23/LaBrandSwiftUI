'use client';

import { cn } from '../../lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-3',
};

function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-border-primary border-t-text-primary',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Full page loading spinner
interface PageLoaderProps {
  message?: string;
}

function PageLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="fixed inset-0 bg-background-primary/80 z-50 flex flex-col items-center justify-center">
      <Spinner size="lg" />
      <p className="mt-4 text-text-secondary">{message}</p>
    </div>
  );
}

// Inline loading state
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

function LoadingOverlay({ isLoading, children, className }: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background-surface/70 flex items-center justify-center z-10">
          <Spinner size="md" />
        </div>
      )}
    </div>
  );
}

export { Spinner, PageLoader, LoadingOverlay };
