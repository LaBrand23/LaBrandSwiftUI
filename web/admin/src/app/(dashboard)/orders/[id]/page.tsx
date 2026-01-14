'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  ShoppingCart,
  User,
  MapPin,
  CreditCard,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Printer,
  MoreHorizontal,
} from 'lucide-react';
import { PageHeader } from '../../../../../../shared/components/layouts/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../shared/components/ui/Card';
import { Button } from '../../../../../../shared/components/ui/Button';
import { Badge, StatusBadge } from '../../../../../../shared/components/ui/Badge';
import { Spinner } from '../../../../../../shared/components/ui/Spinner';
import { Modal } from '../../../../../../shared/components/ui/Modal';
// Input available for future use
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from '../../../../../../shared/components/ui/Dropdown';
import { ordersService } from '../../../../../../shared/services/orders.service';
import { formatCurrency, formatDateTime } from '../../../../../../shared/lib/utils';
import { toast } from '../../../../../../shared/stores/uiStore';
import { OrderStatus } from '../../../../../../shared/types';

const statusActions: Record<OrderStatus, { next: OrderStatus[]; icon: React.ReactNode }> = {
  pending: { next: ['confirmed', 'cancelled'], icon: <Clock className="h-5 w-5" /> },
  confirmed: { next: ['processing', 'cancelled'], icon: <CheckCircle className="h-5 w-5" /> },
  processing: { next: ['shipped', 'cancelled'], icon: <Package className="h-5 w-5" /> },
  shipped: { next: ['delivered'], icon: <Truck className="h-5 w-5" /> },
  delivered: { next: [], icon: <CheckCircle className="h-5 w-5 text-accent-success" /> },
  cancelled: { next: [], icon: <XCircle className="h-5 w-5 text-accent-error" /> },
  refunded: { next: [], icon: <XCircle className="h-5 w-5" /> },
};

const statusSteps: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orderId = params.id as string;

  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelRefund, setCancelRefund] = useState(false);
  const [statusModal, setStatusModal] = useState<{ open: boolean; status: OrderStatus | null }>({
    open: false,
    status: null,
  });
  const [statusNote, setStatusNote] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersService.getOrder(orderId),
    enabled: !!orderId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, note }: { status: OrderStatus; note?: string }) =>
      ordersService.updateOrderStatus(orderId, status, note),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      setStatusModal({ open: false, status: null });
      setStatusNote('');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const cancelMutation = useMutation({
    mutationFn: () => ordersService.cancelOrder(orderId, cancelReason, cancelRefund),
    onSuccess: () => {
      toast.success('Order cancelled');
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      setCancelModal(false);
      setCancelReason('');
      setCancelRefund(false);
    },
    onError: () => toast.error('Failed to cancel order'),
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
        <ShoppingCart className="h-12 w-12 text-text-muted mx-auto mb-4" />
        <p className="text-text-secondary mb-4">Order not found</p>
        <Button variant="neutral" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(order.status);
  const availableActions = statusActions[order.status]?.next || [];

  return (
    <>
      <PageHeader
        title={`Order ${order.order_number}`}
        description={`Placed on ${formatDateTime(order.created_at)}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Orders', href: '/orders' },
          { label: order.order_number },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="neutral" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button variant="neutral" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            {availableActions.length > 0 && (
              <Dropdown>
                <DropdownTrigger asChild>
                  <Button>
                    Update Status
                    <MoreHorizontal className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownTrigger>
                <DropdownContent align="end">
                  {availableActions.map((status) => (
                    <DropdownItem
                      key={status}
                      onClick={() => setStatusModal({ open: true, status })}
                      danger={status === 'cancelled'}
                    >
                      Mark as {status}
                    </DropdownItem>
                  ))}
                </DropdownContent>
              </Dropdown>
            )}
          </div>
        }
      />

      {/* Status Timeline */}
      {!['cancelled', 'refunded'].includes(order.status) && (
        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-accent-success text-white'
                            : 'bg-background-secondary text-text-muted'
                        } ${isCurrent ? 'ring-4 ring-accent-success/20' : ''}`}
                      >
                        {statusActions[step]?.icon}
                      </div>
                      <span
                        className={`mt-2 text-xs font-medium capitalize ${
                          isCompleted ? 'text-accent-success' : 'text-text-muted'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 ${
                          index < currentStepIndex ? 'bg-accent-success' : 'bg-border-primary'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border-subtle">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4">
                    <div className="w-16 h-16 bg-background-secondary rounded-lg overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-text-muted" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product_id}`}
                        className="font-medium text-text-primary hover:underline"
                      >
                        {item.product_name}
                      </Link>
                      {item.variant_name && (
                        <p className="text-sm text-text-muted">{item.variant_name}</p>
                      )}
                      <p className="text-xs text-text-muted">SKU: {item.sku}</p>
                      {item.brand && (
                        <p className="text-xs text-text-tertiary">{item.brand.name}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.price)}</p>
                      <p className="text-sm text-text-muted">x {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.status_history.map((history, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-background-secondary flex items-center justify-center flex-shrink-0">
                      {statusActions[history.status]?.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={history.status} />
                        <span className="text-xs text-text-muted">
                          {formatDateTime(history.changed_at)}
                        </span>
                      </div>
                      {history.note && (
                        <p className="text-sm text-text-secondary mt-1">{history.note}</p>
                      )}
                      {history.changed_by && (
                        <p className="text-xs text-text-muted mt-1">by {history.changed_by}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">
                    Discount
                    {order.discount_code && (
                      <code className="ml-1 text-xs bg-background-secondary px-1 rounded">
                        {order.discount_code}
                      </code>
                    )}
                  </span>
                  <span className="text-accent-success">-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Shipping</span>
                <span>
                  {order.shipping_cost > 0 ? formatCurrency(order.shipping_cost) : 'Free'}
                </span>
              </div>
              <div className="border-t border-border-primary pt-3 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-semibold text-lg">{formatCurrency(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{order.customer.full_name}</p>
                <p className="text-sm text-text-muted">{order.customer.email}</p>
                {order.customer.phone && (
                  <p className="text-sm text-text-muted">{order.customer.phone}</p>
                )}
              </div>
              <Link
                href={`/users/${order.customer.id}`}
                className="text-sm text-button-primary-bg hover:underline"
              >
                View Customer Profile
              </Link>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">{order.shipping_address.full_name}</p>
                <p className="text-sm text-text-secondary">{order.shipping_address.phone}</p>
                <p className="text-sm text-text-secondary">
                  {order.shipping_address.address}
                  {order.shipping_address.district && `, ${order.shipping_address.district}`}
                </p>
                <p className="text-sm text-text-secondary">
                  {order.shipping_address.city}
                  {order.shipping_address.postal_code && ` ${order.shipping_address.postal_code}`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-text-muted">Method</span>
                <Badge variant="neutral">
                  {order.payment_method.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-muted">Status</span>
                <Badge
                  variant={
                    order.payment_status === 'paid'
                      ? 'success'
                      : order.payment_status === 'failed'
                      ? 'error'
                      : 'warning'
                  }
                >
                  {order.payment_status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      <Modal
        isOpen={statusModal.open}
        onClose={() => setStatusModal({ open: false, status: null })}
        title={`Mark as ${statusModal.status}`}
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            Update order status to <strong className="capitalize">{statusModal.status}</strong>?
          </p>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Note (optional)
            </label>
            <textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Add a note about this status change..."
              rows={3}
              className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:border-border-focus bg-background-surface"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="neutral"
              onClick={() => setStatusModal({ open: false, status: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                statusModal.status &&
                updateStatusMutation.mutate({ status: statusModal.status, note: statusNote })
              }
              loading={updateStatusMutation.isPending}
            >
              Update Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Order Modal */}
      <Modal isOpen={cancelModal} onClose={() => setCancelModal(false)} title="Cancel Order">
        <div className="space-y-4">
          <p className="text-text-secondary">
            Are you sure you want to cancel this order? This action cannot be undone.
          </p>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Reason for cancellation
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter the reason for cancellation..."
              rows={3}
              className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:border-border-focus bg-background-surface"
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={cancelRefund}
              onChange={(e) => setCancelRefund(e.target.checked)}
              className="w-4 h-4 rounded border-border-primary"
            />
            <span className="text-sm text-text-primary">Process refund for this order</span>
          </label>
          <div className="flex justify-end gap-3">
            <Button variant="neutral" onClick={() => setCancelModal(false)}>
              Keep Order
            </Button>
            <Button
              variant="danger"
              onClick={() => cancelMutation.mutate()}
              loading={cancelMutation.isPending}
            >
              Cancel Order
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
