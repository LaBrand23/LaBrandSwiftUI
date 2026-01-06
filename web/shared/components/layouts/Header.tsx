'use client';

import { ReactNode } from 'react';
import { Bell, Menu, Search, LogOut, User, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { Avatar } from '../ui/Avatar';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from '../ui/Dropdown';

interface HeaderProps {
  title?: string;
  actions?: ReactNode;
  onMenuClick?: () => void;
  showMobileMenu?: boolean;
  className?: string;
}

function Header({
  title,
  actions,
  onMenuClick,
  showMobileMenu = true,
  className,
}: HeaderProps) {
  const { sidebarCollapsed } = useUIStore();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      const { signOut } = await import('../../lib/firebase');
      await signOut();
      logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-30 h-16 bg-background-surface border-b border-border-primary flex items-center justify-between px-4 sm:px-6',
        className
      )}
    >
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        {showMobileMenu && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded hover:bg-background-secondary"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5 text-text-secondary" />
          </button>
        )}

        {/* Title */}
        {title && (
          <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Custom actions */}
        {actions}

        {/* Search button */}
        <button
          className="p-2 rounded hover:bg-background-secondary"
          aria-label="Search"
        >
          <Search className="h-5 w-5 text-text-secondary" />
        </button>

        {/* Notifications */}
        <button
          className="p-2 rounded hover:bg-background-secondary relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-text-secondary" />
          {/* Notification badge */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-error rounded-full" />
        </button>

        {/* User menu */}
        <Dropdown>
          <DropdownTrigger asChild>
            <button className="flex items-center gap-2 p-1 rounded hover:bg-background-secondary">
              <Avatar
                size="sm"
                src={user?.avatar_url}
                name={user?.full_name || 'User'}
              />
              <span className="hidden sm:block text-sm font-medium text-text-primary max-w-[120px] truncate">
                {user?.full_name || 'User'}
              </span>
            </button>
          </DropdownTrigger>
          <DropdownContent align="end" className="w-56">
            <div className="px-4 py-3 border-b border-border-primary">
              <p className="text-sm font-medium text-text-primary truncate">
                {user?.full_name}
              </p>
              <p className="text-xs text-text-tertiary truncate">
                {user?.email}
              </p>
            </div>
            <DropdownItem onClick={() => {}}>
              <User className="h-4 w-4" />
              Profile
            </DropdownItem>
            <DropdownItem onClick={() => {}}>
              <Settings className="h-4 w-4" />
              Settings
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem onClick={handleLogout} danger>
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>
    </header>
  );
}

export { Header };
