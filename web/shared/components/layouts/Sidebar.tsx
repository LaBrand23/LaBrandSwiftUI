'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon, ChevronLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUIStore } from '../../stores/uiStore';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  children?: NavItem[];
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

interface SidebarProps {
  logo: ReactNode;
  navigation: NavGroup[];
  footer?: ReactNode;
  className?: string;
}

function Sidebar({ logo, navigation, footer, className }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-background-surface border-r border-border-primary z-40 transition-all duration-200',
        sidebarCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Logo */}
      <div className={cn(
        'h-16 flex items-center border-b border-border-primary',
        sidebarCollapsed ? 'justify-center px-2' : 'px-4'
      )}>
        {logo}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navigation.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            {group.label && !sidebarCollapsed && (
              <p className="px-4 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                {group.label}
              </p>
            )}
            <ul className="space-y-1 px-2">
              {group.items.map((item) => (
                <NavItemComponent
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {footer && (
        <div className={cn(
          'border-t border-border-primary p-4',
          sidebarCollapsed && 'p-2'
        )}>
          {footer}
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebarCollapsed}
        className="absolute -right-3 top-20 w-6 h-6 bg-background-surface border border-border-primary rounded-full flex items-center justify-center hover:bg-background-secondary transition-colors"
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronLeft
          className={cn(
            'h-4 w-4 text-text-tertiary transition-transform',
            sidebarCollapsed && 'rotate-180'
          )}
        />
      </button>
    </aside>
  );
}

interface NavItemComponentProps {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
}

function NavItemComponent({ item, pathname, collapsed }: NavItemComponentProps) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const Icon = item.icon;

  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors',
          isActive
            ? 'bg-background-secondary text-text-primary font-medium'
            : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary',
          collapsed && 'justify-center px-2'
        )}
        title={collapsed ? item.label : undefined}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge !== undefined && (
              <span className="px-2 py-0.5 text-xs font-medium bg-accent-error text-white rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    </li>
  );
}

export { Sidebar };
