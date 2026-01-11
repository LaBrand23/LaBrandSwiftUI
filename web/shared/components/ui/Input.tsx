'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const inputVariants = cva(
  'w-full border bg-background-surface text-text-primary placeholder:text-text-muted focus:outline-none transition-colors disabled:bg-background-secondary disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'border-border-primary focus:border-border-focus focus:ring-1 focus:ring-border-focus',
        error: 'border-accent-error focus:border-accent-error focus:ring-1 focus:ring-accent-error',
      },
      inputSize: {
        sm: 'h-8 px-3 text-xs rounded',
        md: 'h-10 px-3 text-sm rounded',
        lg: 'h-12 px-4 text-base rounded',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, variant, inputSize, label, error, helper, leftIcon, rightIcon, ...props },
    ref
  ) => {
    const hasError = !!error || variant === 'error';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            {label}
            {props.required && <span className="text-error-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {leftIcon}
            </span>
          )}
          <input
            className={cn(
              inputVariants({
                variant: hasError ? 'error' : variant,
                inputSize,
                className,
              }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10'
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-error-500">{error}</p>
        )}
        {helper && !error && (
          <p className="mt-1 text-sm text-neutral-500">{helper}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
