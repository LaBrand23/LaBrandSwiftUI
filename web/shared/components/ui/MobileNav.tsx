'use client';

import { useState, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@shared/lib/utils';
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline';

interface MobileNavProps {
  children: ReactNode;
  className?: string;
  triggerClassName?: string;
  overlayClassName?: string;
  position?: 'left' | 'right';
}

export function MobileNav({
  children,
  className,
  triggerClassName,
  overlayClassName,
  position = 'left',
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const trigger = (
    <button
      onClick={() => setIsOpen(true)}
      className={cn(
        'lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors',
        triggerClassName
      )}
      aria-label="Open navigation menu"
    >
      <Bars3Icon className="w-6 h-6 text-neutral-700" />
    </button>
  );

  if (!mounted) {
    return trigger;
  }

  const drawer = isOpen
    ? createPortal(
        <>
          {/* Overlay */}
          <div
            className={cn(
              'fixed inset-0 bg-black/50 z-40 lg:hidden',
              'animate-in fade-in duration-200',
              overlayClassName
            )}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div
            className={cn(
              'fixed top-0 bottom-0 z-50 w-80 max-w-[85vw] bg-white shadow-xl lg:hidden',
              'animate-in duration-300',
              position === 'left'
                ? 'left-0 slide-in-from-left'
                : 'right-0 slide-in-from-right',
              className
            )}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className={cn(
                'absolute top-4 p-2 rounded-lg hover:bg-neutral-100 transition-colors',
                position === 'left' ? 'right-4' : 'left-4'
              )}
              aria-label="Close navigation menu"
            >
              <XMarkIcon className="w-6 h-6 text-neutral-700" />
            </button>

            {/* Content */}
            <div className="h-full overflow-y-auto pt-16 pb-6 px-4">
              {children}
            </div>
          </div>
        </>,
        document.body
      )
    : null;

  return (
    <>
      {trigger}
      {drawer}
    </>
  );
}

interface MobileBottomNavProps {
  items: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive?: boolean;
  }[];
  className?: string;
}

export function MobileBottomNav({ items, className }: MobileBottomNavProps) {
  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 lg:hidden z-30',
        'safe-area-inset-bottom',
        className
      )}
    >
      <div className="flex items-center justify-around h-16">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full',
              'transition-colors duration-200',
              item.isActive
                ? 'text-primary-600'
                : 'text-neutral-500 hover:text-neutral-700'
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

export default MobileNav;
