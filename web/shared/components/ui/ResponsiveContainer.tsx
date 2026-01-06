'use client';

import { ReactNode } from 'react';
import { cn } from '@shared/lib/utils';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

export function ResponsiveContainer({
  children,
  className,
  maxWidth = 'xl',
  padding = true,
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        'w-full mx-auto',
        maxWidthClasses[maxWidth],
        padding && 'px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg';
}

const gapClasses = {
  none: 'gap-0',
  sm: 'gap-2 sm:gap-3',
  md: 'gap-4 sm:gap-6',
  lg: 'gap-6 sm:gap-8',
};

export function ResponsiveGrid({
  children,
  className,
  cols = { default: 1, sm: 2, lg: 3 },
  gap = 'md',
}: ResponsiveGridProps) {
  const colClasses = [
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cn('grid', colClasses, gapClasses[gap], className)}>
      {children}
    </div>
  );
}

interface ResponsiveStackProps {
  children: ReactNode;
  className?: string;
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  breakpoint?: 'sm' | 'md' | 'lg';
  gap?: 'none' | 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

export function ResponsiveStack({
  children,
  className,
  direction = 'row',
  breakpoint = 'md',
  gap = 'md',
  align = 'start',
  justify = 'start',
}: ResponsiveStackProps) {
  const directionClasses = {
    row: `flex-col ${breakpoint}:flex-row`,
    col: `flex-row ${breakpoint}:flex-col`,
    'row-reverse': `flex-col-reverse ${breakpoint}:flex-row-reverse`,
    'col-reverse': `flex-row-reverse ${breakpoint}:flex-col-reverse`,
  };

  return (
    <div
      className={cn(
        'flex',
        directionClasses[direction],
        gapClasses[gap],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
    >
      {children}
    </div>
  );
}

interface HiddenProps {
  children: ReactNode;
  className?: string;
  above?: 'sm' | 'md' | 'lg' | 'xl';
  below?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Hidden({ children, className, above, below }: HiddenProps) {
  const hiddenClasses = [];

  if (above) {
    hiddenClasses.push(`${above}:hidden`);
  }

  if (below) {
    const breakpointOrder = ['sm', 'md', 'lg', 'xl'];
    const idx = breakpointOrder.indexOf(below);
    if (idx >= 0) {
      hiddenClasses.push('hidden');
      hiddenClasses.push(`${below}:block`);
    }
  }

  return <div className={cn(hiddenClasses.join(' '), className)}>{children}</div>;
}

interface ShowProps {
  children: ReactNode;
  className?: string;
  above?: 'sm' | 'md' | 'lg' | 'xl';
  below?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Show({ children, className, above, below }: ShowProps) {
  const showClasses = [];

  if (above) {
    showClasses.push('hidden');
    showClasses.push(`${above}:block`);
  }

  if (below) {
    showClasses.push(`${below}:hidden`);
  }

  return <div className={cn(showClasses.join(' '), className)}>{children}</div>;
}

export default ResponsiveContainer;
