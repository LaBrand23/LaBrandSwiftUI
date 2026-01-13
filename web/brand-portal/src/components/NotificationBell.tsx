'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { notificationsService } from '@shared/services/notifications.service';
import { Notification, NotificationType } from '@shared/types';
import { formatDate } from '@shared/lib/utils';
import { Button } from '@shared/components/ui/Button';
import { Spinner } from '@shared/components/ui/Spinner';
import {
  BellIcon,
  ShoppingBagIcon,
  StarIcon,
  ExclamationTriangleIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';

function getNotificationIcon(type: NotificationType) {
  const iconClass = 'w-4 h-4';
  switch (type) {
    case 'new_order':
      return <ShoppingBagIcon className={`${iconClass} text-primary-500`} />;
    case 'new_review':
      return <StarIcon className={`${iconClass} text-warning-500`} />;
    case 'low_stock':
      return <ExclamationTriangleIcon className={`${iconClass} text-error-500`} />;
    case 'order_status':
      return <TruckIcon className={`${iconClass} text-info-500`} />;
    default:
      return <BellIcon className={`${iconClass} text-neutral-500`} />;
  }
}

export function NotificationBell() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => notificationsService.getUnreadCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get recent notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications-recent'],
    queryFn: () => notificationsService.getNotifications({ limit: 5 }),
    enabled: isOpen, // Only fetch when dropdown is open
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-recent'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    setIsOpen(false);

    // Navigate based on notification type
    if (notification.data?.order_id) {
      router.push(`/orders?id=${notification.data.order_id}`);
    } else if (notification.data?.review_id) {
      router.push('/reviews');
    } else if (notification.data?.product_id) {
      router.push(`/products/${notification.data.product_id}`);
    } else {
      router.push('/notifications');
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    router.push('/notifications');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellSolidIcon className="w-6 h-6" />
        ) : (
          <BellIcon className="w-6 h-6" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-neutral-200 z-50">
          <div className="p-3 border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs text-primary-600 font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="sm" />
              </div>
            ) : !notificationsData?.notifications?.length ? (
              <div className="text-center py-8 px-4">
                <BellIcon className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {notificationsData.notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left p-3 hover:bg-neutral-50 transition-colors ${
                      !notification.is_read ? 'bg-primary-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-neutral-900 truncate">
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 truncate mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-neutral-100">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={handleViewAll}
            >
              View all notifications
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
