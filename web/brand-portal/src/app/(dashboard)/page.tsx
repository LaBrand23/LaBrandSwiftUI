'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@shared/stores/authStore';
import { analyticsService } from '@shared/services/analytics.service';
import { formatCurrency } from '@shared/lib/utils';
import { Card } from '@shared/components/ui/Card';
import { Spinner } from '@shared/components/ui/Spinner';
import { Badge } from '@shared/components/ui/Badge';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  format = 'number',
}: {
  title: string;
  value: number;
  change?: number;
  icon: React.ElementType;
  format?: 'number' | 'currency';
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500">{title}</p>
          <p className="text-2xl font-semibold text-neutral-900 mt-1">
            {format === 'currency' ? formatCurrency(value) : value.toLocaleString()}
          </p>
          {change !== undefined && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm ${
                change >= 0 ? 'text-success-600' : 'text-error-600'
              }`}
            >
              {change >= 0 ? (
                <ArrowUpIcon className="w-4 h-4" />
              ) : (
                <ArrowDownIcon className="w-4 h-4" />
              )}
              <span>{Math.abs(change).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-primary-50 rounded-lg">
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const brandId = user?.brand_id;

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['brand-dashboard', brandId],
    queryFn: () =>
      analyticsService.getDashboard({
        brand_id: brandId,
        period: 'month',
      }),
    enabled: !!brandId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-500 mt-1">
          Welcome back, {user?.full_name}! Here&apos;s your brand overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={dashboardData?.overview.total_revenue || 0}
          change={dashboardData?.overview.revenue_change}
          icon={CurrencyDollarIcon}
          format="currency"
        />
        <StatCard
          title="Total Orders"
          value={dashboardData?.overview.total_orders || 0}
          change={dashboardData?.overview.orders_change}
          icon={ShoppingCartIcon}
        />
        <StatCard
          title="Active Products"
          value={dashboardData?.inventory_alerts?.out_of_stock ? 0 : 0}
          icon={CubeIcon}
        />
        <StatCard
          title="Avg Order Value"
          value={dashboardData?.overview.average_order_value || 0}
          change={dashboardData?.overview.aov_change}
          icon={CurrencyDollarIcon}
          format="currency"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Recent Orders
          </h2>
          {dashboardData?.recent_orders && dashboardData.recent_orders.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recent_orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-neutral-900">
                      #{order.order_number}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {order.customer.full_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-neutral-900">
                      {formatCurrency(order.total)}
                    </p>
                    <Badge
                      variant={
                        order.status === 'delivered'
                          ? 'success'
                          : order.status === 'cancelled'
                          ? 'error'
                          : order.status === 'pending'
                          ? 'warning'
                          : 'info'
                      }
                      size="sm"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              No recent orders
            </div>
          )}
        </Card>

        {/* Inventory Alerts */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Inventory Alerts
          </h2>
          {dashboardData?.inventory_alerts ? (
            <div className="space-y-4">
              <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-error-600" />
                  <div>
                    <p className="font-medium text-error-700">Out of Stock</p>
                    <p className="text-2xl font-bold text-error-600">
                      {dashboardData.inventory_alerts.out_of_stock}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-warning-600" />
                  <div>
                    <p className="font-medium text-warning-700">Low Stock</p>
                    <p className="text-2xl font-bold text-warning-600">
                      {dashboardData.inventory_alerts.low_stock}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              No alerts
            </div>
          )}
        </Card>
      </div>

      {/* Top Products */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Top Selling Products
        </h2>
        {dashboardData?.top_products && dashboardData.top_products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">
                    Product
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-neutral-500">
                    Units Sold
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-neutral-500">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.top_products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-neutral-100 last:border-0"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-100 rounded overflow-hidden">
                          {product.image_url && (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <span className="font-medium text-neutral-900">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-neutral-600">
                      {product.total_sold}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-neutral-900">
                      {formatCurrency(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-neutral-500">
            No product data available
          </div>
        )}
      </Card>
    </div>
  );
}
