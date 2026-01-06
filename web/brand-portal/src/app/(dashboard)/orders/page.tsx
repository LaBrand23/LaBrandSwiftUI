'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@shared/stores/authStore';
import { useUIStore } from '@shared/stores/uiStore';
import { ordersService } from '@shared/services/orders.service';
import { Order, OrderStatus, OrdersQueryParams } from '@shared/types';
import { formatCurrency, formatDate } from '@shared/lib/utils';
import Card from '@shared/components/ui/Card';
import Button from '@shared/components/ui/Button';
import Badge from '@shared/components/ui/Badge';
import Spinner from '@shared/components/ui/Spinner';
import Modal from '@shared/components/ui/Modal';
import Pagination from '@shared/components/ui/Pagination';
import Select from '@shared/components/ui/Select';
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  EyeIcon,
  CheckIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const statusBadgeVariant: Record<OrderStatus, 'warning' | 'info' | 'success' | 'error' | 'neutral'> = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'neutral',
};

export default function OrdersPage() {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();
  const brandId = user?.brand_assignment?.brand_id;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const queryParams: OrdersQueryParams = {
    brand_id: brandId,
    page: currentPage,
    limit: 15,
    status: statusFilter as OrderStatus || undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['orders', queryParams],
    queryFn: () => ordersService.getAll(queryParams),
    enabled: !!brandId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      ordersService.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      addToast('Order status updated', 'success');
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to update order', 'error');
    },
  });

  const openDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleStatusUpdate = (orderId: string, status: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Orders</h1>
        <p className="text-neutral-500 mt-1">
          Manage and fulfill customer orders
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Pending</div>
          <div className="text-2xl font-semibold text-warning-600 mt-1">
            {data?.orders.filter((o) => o.status === 'pending').length || 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Processing</div>
          <div className="text-2xl font-semibold text-info-600 mt-1">
            {data?.orders.filter((o) => o.status === 'processing').length || 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Shipped</div>
          <div className="text-2xl font-semibold text-primary-600 mt-1">
            {data?.orders.filter((o) => o.status === 'shipped').length || 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Delivered</div>
          <div className="text-2xl font-semibold text-success-600 mt-1">
            {data?.orders.filter((o) => o.status === 'delivered').length || 0}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by order number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={statusOptions}
            className="w-40"
          />
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : !data?.orders.length ? (
          <div className="text-center py-12">
            <ShoppingCartIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              No orders found
            </h3>
            <p className="text-neutral-500">
              Orders will appear here when customers make purchases.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                    Order
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                    Date
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                    Total
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-neutral-100 hover:bg-neutral-50"
                  >
                    <td className="py-3 px-4">
                      <span className="font-medium text-neutral-900">
                        #{order.order_number}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-neutral-900">{order.customer.full_name}</p>
                        <p className="text-sm text-neutral-500">{order.customer.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-neutral-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={statusBadgeVariant[order.status]}
                        size="sm"
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailModal(order)}
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Button>

                        {order.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleStatusUpdate(order.id, 'confirmed')
                            }
                          >
                            <CheckIcon className="w-4 h-4 text-success-600" />
                          </Button>
                        )}

                        {order.status === 'processing' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleStatusUpdate(order.id, 'shipped')
                            }
                          >
                            <TruckIcon className="w-4 h-4 text-primary-600" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {/* Order Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Order #${selectedOrder?.order_number}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Date</p>
                <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <Badge variant={statusBadgeVariant[selectedOrder.status]}>
                {selectedOrder.status}
              </Badge>
            </div>

            <div className="p-4 bg-neutral-50 rounded-lg">
              <p className="text-sm text-neutral-500">Customer</p>
              <p className="font-medium">{selectedOrder.customer.full_name}</p>
              <p className="text-sm text-neutral-600">{selectedOrder.customer.email}</p>
              {selectedOrder.customer.phone && (
                <p className="text-sm text-neutral-600">{selectedOrder.customer.phone}</p>
              )}
            </div>

            <div className="border-t border-neutral-200 pt-4">
              <div className="flex justify-between py-2">
                <span className="text-neutral-600">Subtotal</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount_amount > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-neutral-600">Discount</span>
                  <span className="text-success-600">
                    -{formatCurrency(selectedOrder.discount_amount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2">
                <span className="text-neutral-600">Shipping</span>
                <span>{formatCurrency(selectedOrder.shipping_cost)}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-neutral-200 font-semibold">
                <span>Total</span>
                <span>{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="ghost"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
