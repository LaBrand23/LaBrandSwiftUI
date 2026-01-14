'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

// Simple tabs interface (standalone mode)
interface SimpleTabsProps {
  tabs: Array<{ id: string; label: string }>;
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

// Compound tabs interface (with children)
interface CompoundTabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

type TabsProps = SimpleTabsProps | CompoundTabsProps;

function isSimpleTabs(props: TabsProps): props is SimpleTabsProps {
  return 'tabs' in props && 'onChange' in props;
}

function Tabs(props: TabsProps) {
  // Simple standalone tabs mode
  if (isSimpleTabs(props)) {
    const { tabs, activeTab, onChange, className } = props;
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1 p-1 bg-background-secondary rounded-lg',
          className
        )}
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-1',
              activeTab === tab.id
                ? 'bg-background-surface text-text-primary shadow-sm'
                : 'text-text-tertiary hover:text-text-primary'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  // Compound tabs mode with children
  const { defaultValue, value, onValueChange, children, className } = props;
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const activeTab = value ?? internalValue;

  const setActiveTab = (newValue: string) => {
    if (!value) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 p-1 bg-background-secondary rounded-lg',
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

function TabsTrigger({
  value,
  children,
  className,
  disabled = false,
}: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={cn(
        'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-1',
        isActive
          ? 'bg-background-surface text-text-primary shadow-sm'
          : 'text-text-tertiary hover:text-text-primary',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

function TabsContent({ value, children, className }: TabsContentProps) {
  const { activeTab } = useTabs();

  if (activeTab !== value) return null;

  return (
    <div role="tabpanel" className={cn('mt-4', className)}>
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
