'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@shared/stores/authStore';
import { useUIStore } from '@shared/stores/uiStore';
import { ordersService } from '@shared/services/orders.service';
import { OrderStatus } from '@shared/types';
import { formatCurrency, formatDate } from '@shared/lib/utils';
import Card from '@shared/components/ui/Card';
import Button from '@shared/components/ui/Button';
import Badge from '@shared/components/ui/Badge';
import Spinner from '@shared/components/ui/Spinner';
import Modal from '@shared/components/ui/Modal';
import {
  ArrowLeftIcon,
  ShoppingCartIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CubeIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';

const statusBadgeVariant: Record<OrderStatus, 'warning' | 'info' | 'success' | 'error' | 'neutral'> = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'neutral',
};

const statusFlow: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const orderId = params.id as string;
  const brandId = user?.brand_assignment?.brand_id;

  const [statusModal, setStatusModal] = useState<{ open: boolean; status: OrderStatus | null }>({
    open: false,
    status: null,
  });
  const [cancelModal, setCancelModal] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersService.getById(orderId),
    enabled: !!orderId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: OrderStatus) => ordersService.updateStatus(orderId, status),
    onSuccess: () => {
      addToast('Order status updated successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setStatusModal({ open: false, status: null });
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to update order status', 'error');
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: () => ordersService.cancel(orderId),
    onSuccess: () => {
      addToast('Order cancelled', 'success');
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setCancelModal(false);
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to cancel order', 'error');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <ShoppingCartIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 mb-2">Order not found</h3>
        <p className="text-neutral-500 mb-4">The order you're looking for doesn't exist.</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  // Verify order belongs to user's brand
  const orderBrandId = order.items?.[0]?.product?.brand_id;
  if (orderBrandId && orderBrandId !== brandId) {
    return (
      <div className="text-center py-12">
        <ShoppingCartIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 mb-2">Access Denied</h3>
        <p className="text-neutral-500 mb-4">You don't have permission to view this order.</p>
        <Button variant="outline" onClick={() => router.push('/orders')}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

  const currentStatusIndex = statusFlow.indexOf(order.status);
  const canAdvanceStatus = order.status !== 'cancelled' && order.status !== 'delivered' && order.status !== 'refunded';
  const nextStatus = canAdvanceStatus ? statusFlow[currentStatusIndex + 1] : null;

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-5 h-5" />;
      case 'confirmed':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'processing':
        return <CubeIcon className="w-5 h-5" />;
      case 'shipped':
        return <TruckIcon className="w-5 h-5" />;
      case 'delivered':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5" />;
      default:
        return <ClockIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-neutral-900">
                Order #{order.order_number}
              </h1>
              <Badge variant={statusBadgeVariant[order.status]}>
                {order.status}
              </Badge>
            </div>
            <p className="text-neutral-500 mt-1">{formatDate(order.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <PrinterIcon className="w-4 h-4 mr-2" />
            Print
          </Button>
          {nextStatus && (
            <Button onClick={() => setStatusModal({ open: true, status: nextStatus })}>
              {getStatusIcon(nextStatus)}
              <span className="ml-2 capitalize">Mark as {nextStatus}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Order Progress</h2>
          <div className="flex items-center justify-between">
            {statusFlow.map((status, index) => {
              const isPast = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const isCancelled = order.status === 'cancelled' || order.status === 'refunded';

              return (
                <div key={status} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCancelled
                          ? 'bg-neutral-100 text-neutral-400'
                          : isPast
                          ? 'bg-success-500 text-white'
                          : 'bg-neutral-100 text-neutral-400'
                      } ${isCurrent && !isCancelled ? 'ring-2 ring-success-200' : ''}`}
                    >
                      {getStatusIcon(status)}
                    </div>
                    <span
                      className={`text-xs mt-2 capitalize ${
                        isCancelled
                          ? 'text-neutral-400'
                          : isPast
                          ? 'text-success-600 font-medium'
                          : 'text-neutral-400'
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  {index < statusFlow.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded ${
                        isCancelled
                          ? 'bg-neutral-200'
                          : index < currentStatusIndex
                          ? 'bg-success-500'
                          : 'bg-neutral-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {order.status === 'cancelled' && (
            <div className="mt-4 p-3 bg-error-50 border border-error-200 rounded-lg">
              <p className="text-sm text-error-700 font-medium">This order has been cancelled</p>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Order Items ({order.items?.length || 0})
              </h2>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg"
                  >
                    <div className="w-16 h-16 bg-neutral-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0] as string}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <CubeIcon className="w-8 h-8 text-neutral-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-neutral-900 truncate">
                        {item.product_name}
                      </h3>
                      {item.variant && (
                        <p className="text-sm text-neutral-500">
                          {[item.variant.color, item.variant.size].filter(Boolean).join(' / ')}
                        </p>
                      )}
                      <p className="text-sm text-neutral-600 mt-1">
                        {formatCurrency(item.unit_price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neutral-900">
                        {formatCurrency(item.total_price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Shipping Address */}
          {order.shipping_address && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Shipping Address</h2>
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-neutral-900">
                      {order.shipping_address.recipient_name}
                    </p>
                    <p className="text-neutral-600 mt-1">
                      {order.shipping_address.address_line1}
                      {order.shipping_address.address_line2 && (
                        <>, {order.shipping_address.address_line2}</>
                      )}
                    </p>
                    <p className="text-neutral-600">
                      {order.shipping_address.city}
                      {order.shipping_address.district && `, ${order.shipping_address.district}`}
                    </p>
                    {order.shipping_address.phone && (
                      <p className="text-neutral-600 mt-2 flex items-center gap-2">
                        <PhoneIcon className="w-4 h-4" />
                        {order.shipping_address.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Customer</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-neutral-500" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">{order.customer?.full_name}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <EnvelopeIcon className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-600">{order.customer?.email}</span>
                </div>
                {order.customer?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <PhoneIcon className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-600">{order.customer.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Order Summary */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="text-neutral-900">{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Discount</span>
                    <span className="text-success-600">
                      -{formatCurrency(order.discount_amount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Shipping</span>
                  <span className="text-neutral-900">{formatCurrency(order.shipping_cost)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-neutral-200">
                  <span className="font-semibold text-neutral-900">Total</span>
                  <span className="font-semibold text-neutral-900">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Payment</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Method</span>
                  <span className="text-neutral-900 capitalize">
                    {order.payment_method?.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Status</span>
                  <Badge
                    variant={order.payment_status === 'paid' ? 'success' : 'warning'}
                    size="sm"
                  >
                    {order.payment_status}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          {canAdvanceStatus && (
            <Card>
              <div className="p-6 space-y-3">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Actions</h2>

                {order.status === 'pending' && (
                  <Button
                    className="w-full"
                    onClick={() => setStatusModal({ open: true, status: 'confirmed' })}
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Confirm Order
                  </Button>
                )}

                {order.status === 'confirmed' && (
                  <Button
                    className="w-full"
                    onClick={() => setStatusModal({ open: true, status: 'processing' })}
                  >
                    <CubeIcon className="w-4 h-4 mr-2" />
                    Start Processing
                  </Button>
                )}

                {order.status === 'processing' && (
                  <Button
                    className="w-full"
                    onClick={() => setStatusModal({ open: true, status: 'shipped' })}
                  >
                    <TruckIcon className="w-4 h-4 mr-2" />
                    Mark as Shipped
                  </Button>
                )}

                {order.status === 'shipped' && (
                  <Button
                    className="w-full"
                    onClick={() => setStatusModal({ open: true, status: 'delivered' })}
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Mark as Delivered
                  </Button>
                )}

                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={() => setCancelModal(true)}
                  >
                    <XCircleIcon className="w-4 h-4 mr-2" />
                    Cancel Order
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={statusModal.open}
        onClose={() => setStatusModal({ open: false, status: null })}
        title={`Update Order Status`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            Are you sure you want to mark this order as{' '}
            <strong className="capitalize">{statusModal.status}</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="ghost" onClick={() => setStatusModal({ open: false, status: null })}>
              Cancel
            </Button>
            <Button
              onClick={() => statusModal.status && updateStatusMutation.mutate(statusModal.status)}
              isLoading={updateStatusMutation.isPending}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={cancelModal}
        onClose={() => setCancelModal(false)}
        title="Cancel Order"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            Are you sure you want to cancel this order? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="ghost" onClick={() => setCancelModal(false)}>
              Keep Order
            </Button>
            <Button
              variant="danger"
              onClick={() => cancelOrderMutation.mutate()}
              isLoading={cancelOrderMutation.isPending}
            >
              Cancel Order
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
