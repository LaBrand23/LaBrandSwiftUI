'use client';

import { HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center font-medium',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800',
        neutral: 'bg-gray-100 text-gray-600',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
        purple: 'bg-purple-100 text-purple-800',
        outline: 'border border-border-primary text-text-secondary bg-transparent',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs rounded',
        md: 'px-2.5 py-0.5 text-xs rounded-full',
        lg: 'px-3 py-1 text-sm rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  variant?: 'default' | 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
  className?: string;
}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props} />
  );
}

// Helper component for status badges
interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: string;
}

const statusVariantMap: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default' | 'purple'> = {
  // Order statuses
  pending: 'warning',
  confirmed: 'info',
  processing: 'purple',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'default',

  // Product statuses
  draft: 'default',
  active: 'success',
  archived: 'error',

  // Stock statuses
  in_stock: 'success',
  low_stock: 'warning',
  out_of_stock: 'error',

  // Boolean-like statuses
  approved: 'success',
  rejected: 'error',
  true: 'success',
  false: 'error',
};

function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  if (!status) {
    return (
      <Badge variant="default" className={cn('capitalize', className)} {...props}>
        unknown
      </Badge>
    );
  }
  const variant = statusVariantMap[status.toLowerCase()] || 'default';
  const displayStatus = status.replace(/_/g, ' ');

  return (
    <Badge
      variant={variant}
      className={cn('capitalize', className)}
      {...props}
    >
      {displayStatus}
    </Badge>
  );
}

export { Badge, badgeVariants, StatusBadge };
