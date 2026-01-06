'use client';

import { ReactNode, forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { Input, InputProps } from '../ui/Input';

interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

function FormField({
  label,
  error,
  hint,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary">
          {label}
          {required && <span className="text-accent-error ml-1">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-text-muted">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-accent-error">{error}</p>
      )}
    </div>
  );
}

// Convenience component that combines FormField with Input
interface FormInputProps extends InputProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  containerClassName?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, hint, required, containerClassName, ...inputProps }, ref) => {
    return (
      <FormField
        label={label}
        error={error}
        hint={hint}
        required={required}
        className={containerClassName}
      >
        <Input ref={ref} error={error} {...inputProps} />
      </FormField>
    );
  }
);

FormInput.displayName = 'FormInput';

export { FormField, FormInput };
