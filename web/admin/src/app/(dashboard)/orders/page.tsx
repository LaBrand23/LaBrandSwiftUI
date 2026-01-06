'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Search,
  MoreHorizontal,
  Eye,
  ShoppingCart,
  Calendar,
  Filter,
} from 'lucide-react';
import { PageHeader } from '../../../../../shared/components/layouts/PageHeader';
import { Card, CardContent } from '../../../../../shared/components/ui/Card';
import { Button } from '../../../../../shared/components/ui/Button';
import { Input } from '../../../../../shared/components/ui/Input';
import { Select, SelectOption } from '../../../../../shared/components/ui/Select';
import { StatusBadge } from '../../../../../shared/components/ui/Badge';
import { Pagination, PaginationInfo } from '../../../../../shared/components/ui/Pagination';
import { Spinner } from '../../../../../shared/components/ui/Spinner';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from '../../../../../shared/components/ui/Dropdown';
import { ordersService } from '../../../../../shared/services/orders.service';
import { formatCurrency, formatDateTime, formatRelativeTime } from '../../../../../shared/lib/utils';
import { toast } from '../../../../../shared/stores/uiStore';
import { OrderStatus } from '../../../../../shared/types';

const statusOptions: SelectOption[] = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

const orderStatusActions: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
  refunded: [],
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['orders', page, search, statusFilter, dateFrom, dateTo],
    queryFn: () =>
      ordersService.getOrders({
        page,
        limit: 20,
        status: statusFilter as OrderStatus || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      }),
  });

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await ordersService.updateOrderStatus(orderId, status);
      toast.success('Order status updated');
      refetch();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  return (
    <>
      <PageHeader
        title="Orders"
        description="Manage customer orders"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Orders' },
        ]}
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by order number or customer..."
                leftIcon={<Search className="h-4 w-4" />}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-36"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-36"
                />
                <span className="text-text-muted">to</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-36"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-border-primary bg-background-secondary">
                      <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Order
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Items
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Total
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((order) => {
                      const availableActions = orderStatusActions[order.status] || [];

                      return (
                        <tr
                          key={order.id}
                          className="border-b border-border-subtle hover:bg-background-secondary"
                        >
                          <td className="px-4 py-3">
                            <Link
                              href={`/orders/${order.id}`}
                              className="text-sm font-medium text-text-primary hover:underline"
                            >
                              {order.order_number}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-text-primary">
                                {order.customer.full_name}
                              </p>
                              <p className="text-xs text-text-muted">
                                {order.customer.phone || order.customer.email}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-text-secondary">
                              {order.items_count} item{order.items_count !== 1 && 's'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-text-primary">
                              {formatCurrency(order.total)}
                            </p>
                            {order.discount_amount > 0 && (
                              <p className="text-xs text-accent-success">
                                -{formatCurrency(order.discount_amount)}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm text-text-secondary">
                                {formatRelativeTime(order.created_at)}
                              </p>
                              <p className="text-xs text-text-muted">
                                {formatDateTime(order.created_at)}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Dropdown>
                              <DropdownTrigger asChild>
                                <Button variant="ghost" size="icon-sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownTrigger>
                              <DropdownContent align="end">
                                <DropdownItem
                                  onClick={() => {
                                    window.location.href = `/orders/${order.id}`;
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </DropdownItem>
                                {availableActions.length > 0 && (
                                  <>
                                    <DropdownSeparator />
                                    {availableActions.map((status) => (
                                      <DropdownItem
                                        key={status}
                                        onClick={() => handleUpdateStatus(order.id, status)}
                                        danger={status === 'cancelled'}
                                      >
                                        Mark as {status}
                                      </DropdownItem>
                                    ))}
                                  </>
                                )}
                              </DropdownContent>
                            </Dropdown>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.pagination && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border-primary">
                  <PaginationInfo
                    currentPage={data.pagination.page}
                    pageSize={data.pagination.limit}
                    totalItems={data.pagination.total}
                  />
                  <Pagination
                    currentPage={data.pagination.page}
                    totalPages={data.pagination.totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-secondary">No orders found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
