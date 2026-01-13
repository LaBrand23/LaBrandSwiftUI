'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { notificationsService } from '@shared/services/notifications.service';
import { Notification, NotificationType } from '@shared/types';
import { formatDate } from '@shared/lib/utils';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/Badge';
import { Spinner } from '@shared/components/ui/Spinner';
import { Pagination } from '@shared/components/ui/Pagination';
import { Select } from '@shared/components/ui/Select';
import { toast } from 'sonner';
import {
  BellIcon,
  ShoppingBagIcon,
  StarIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  TrashIcon,
  CheckIcon,
  EnvelopeOpenIcon,
} from '@heroicons/react/24/outline';

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'new_order', label: 'New Orders' },
  { value: 'new_review', label: 'New Reviews' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'order_status', label: 'Order Updates' },
];

const readOptions = [
  { value: '', label: 'All' },
  { value: 'false', label: 'Unread' },
  { value: 'true', label: 'Read' },
];

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'new_order':
      return <ShoppingBagIcon className="w-5 h-5 text-primary-500" />;
    case 'new_review':
      return <StarIcon className="w-5 h-5 text-warning-500" />;
    case 'low_stock':
      return <ExclamationTriangleIcon className="w-5 h-5 text-error-500" />;
    case 'order_status':
      return <TruckIcon className="w-5 h-5 text-info-500" />;
    default:
      return <BellIcon className="w-5 h-5 text-neutral-500" />;
  }
}

function getNotificationBadge(type: NotificationType) {
  switch (type) {
    case 'new_order':
      return <Badge variant="primary" size="sm">Order</Badge>;
    case 'new_review':
      return <Badge variant="warning" size="sm">Review</Badge>;
    case 'low_stock':
      return <Badge variant="error" size="sm">Stock</Badge>;
    case 'order_status':
      return <Badge variant="info" size="sm">Update</Badge>;
    default:
      return <Badge variant="secondary" size="sm">Info</Badge>;
  }
}

function getNavigationPath(notification: Notification): string | null {
  if (notification.data?.order_id) {
    return `/orders?id=${notification.data.order_id}`;
  }
  if (notification.data?.review_id) {
    return '/reviews';
  }
  if (notification.data?.product_id) {
    return `/products/${notification.data.product_id}`;
  }
  return null;
}

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [readFilter, setReadFilter] = useState('');

  const queryParams = {
    page: currentPage,
    limit: 15,
    type: typeFilter as NotificationType | undefined,
    is_read: readFilter ? readFilter === 'true' : undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', queryParams],
    queryFn: () => notificationsService.getNotifications(queryParams),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark as read');
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      toast.success('All notifications marked as read');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark all as read');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      toast.success('Notification deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete notification');
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate to related resource
    const path = getNavigationPath(notification);
    if (path) {
      router.push(path);
    }
  };

  const unreadCount = data?.notifications?.filter((n) => !n.is_read).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Notifications</h1>
          <p className="text-neutral-500 mt-1">
            Stay updated with your store activity
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllAsReadMutation.mutate()}
            isLoading={markAllAsReadMutation.isPending}
            leftIcon={<EnvelopeOpenIcon className="w-4 h-4" />}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <Select
            value={typeFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={typeOptions}
            className="w-40"
          />
          <Select
            value={readFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setReadFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={readOptions}
            className="w-32"
          />
          {(typeFilter || readFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTypeFilter('');
                setReadFilter('');
                setCurrentPage(1);
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </Card>

      {/* Notifications List */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : !data?.notifications?.length ? (
          <div className="text-center py-12">
            <BellIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              No notifications
            </h3>
            <p className="text-neutral-500">
              You&apos;re all caught up! New notifications will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {data.notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-neutral-50 transition-colors cursor-pointer ${
                  !notification.is_read ? 'bg-primary-50/50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getNotificationBadge(notification.type)}
                          {!notification.is_read && (
                            <span className="w-2 h-2 rounded-full bg-primary-500" />
                          )}
                        </div>
                        <h4 className="font-medium text-neutral-900">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-neutral-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-neutral-400 mt-2">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              markAsReadMutation.mutate(notification.id);
                            }}
                            title="Mark as read"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            deleteMutation.mutate(notification.id);
                          }}
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4 text-error-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="p-4 border-t border-neutral-100">
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
