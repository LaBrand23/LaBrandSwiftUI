'use client';

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
} from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DropdownContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  close: () => void;
}

const DropdownContext = createContext<DropdownContextValue | undefined>(
  undefined
);

function useDropdown() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within a Dropdown');
  }
  return context;
}

interface DropdownProps {
  children: ReactNode;
  className?: string;
}

function Dropdown({ children, className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const close = () => setIsOpen(false);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, close }}>
      <div ref={dropdownRef} className={cn('relative inline-block', className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

interface DropdownTriggerProps {
  children: ReactNode;
  className?: string;
  asChild?: boolean;
}

function DropdownTrigger({ children, className, asChild }: DropdownTriggerProps) {
  const { isOpen, setIsOpen } = useDropdown();

  if (asChild) {
    return (
      <div onClick={() => setIsOpen(!isOpen)} className={className}>
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2 text-sm border border-border-primary rounded bg-background-surface hover:bg-background-secondary transition-colors',
        className
      )}
    >
      {children}
      <ChevronDown
        className={cn(
          'h-4 w-4 transition-transform',
          isOpen && 'rotate-180'
        )}
      />
    </button>
  );
}

interface DropdownContentProps {
  children: ReactNode;
  className?: string;
  align?: 'start' | 'end' | 'center';
}

function DropdownContent({
  children,
  className,
  align = 'start',
}: DropdownContentProps) {
  const { isOpen } = useDropdown();

  if (!isOpen) return null;

  const alignClasses = {
    start: 'left-0',
    end: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div
      className={cn(
        'absolute z-50 mt-1 min-w-[180px] py-1 bg-background-surface rounded-lg border border-border-primary shadow-dropdown animate-fade-in',
        alignClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}

function DropdownItem({
  children,
  className,
  onClick,
  disabled,
  danger,
}: DropdownItemProps) {
  const { close } = useDropdown();

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    close();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-2 px-4 py-2 text-sm text-left transition-colors',
        !disabled && 'hover:bg-background-secondary',
        disabled && 'opacity-50 cursor-not-allowed',
        danger && 'text-accent-error',
        !danger && 'text-text-secondary',
        className
      )}
    >
      {children}
    </button>
  );
}

function DropdownSeparator({ className }: { className?: string }) {
  return (
    <div className={cn('my-1 h-px bg-border-primary', className)} />
  );
}

function DropdownLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'px-4 py-1.5 text-xs font-semibold text-text-muted uppercase',
        className
      )}
    >
      {children}
    </div>
  );
}

export {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
};
