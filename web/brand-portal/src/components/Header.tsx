'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@shared/stores/authStore';
import { authService } from '@shared/services/auth.service';
import { Avatar } from '@shared/components/ui/Avatar';
import {
  BellIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    logout();
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Mobile Menu */}
      <button className="lg:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg">
        <Bars3Icon className="w-6 h-6" />
      </button>

      {/* Search - hidden on mobile */}
      <div className="hidden md:block flex-1 max-w-md">
        {/* Placeholder for search if needed */}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
          <BellIcon className="w-6 h-6" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full" />
        </button>

        {/* User Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Avatar
              src={user?.avatar_url}
              name={user?.full_name || 'User'}
              size="sm"
            />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-neutral-900">
                {user?.full_name}
              </p>
              <p className="text-xs text-neutral-500">Brand Manager</p>
            </div>
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg border border-neutral-200 shadow-medium py-1 animate-fade-in">
              <div className="px-4 py-3 border-b border-neutral-100">
                <p className="font-medium text-neutral-900">{user?.full_name}</p>
                <p className="text-sm text-neutral-500">{user?.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push('/profile');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                >
                  <UserCircleIcon className="w-5 h-5" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push('/profile/settings');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                  Settings
                </button>
              </div>

              <div className="border-t border-neutral-100 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error-600 hover:bg-error-50"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
