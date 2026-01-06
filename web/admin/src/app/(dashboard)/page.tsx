'use client';

import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '../../../../shared/components/layouts/PageHeader';
import { StatsCard, Card, CardHeader, CardTitle, CardContent } from '../../../../shared/components/ui/Card';
import { StatusBadge } from '../../../../shared/components/ui/Badge';
import { Spinner } from '../../../../shared/components/ui/Spinner';
import { apiClient } from '../../../../shared/lib/api';
import { formatCurrency, formatNumber, formatRelativeTime } from '../../../../shared/lib/utils';
import { DashboardData, Order, Product } from '../../../../shared/types';

// Fetch dashboard data
async function fetchDashboard(period: string = '30d'): Promise<DashboardData> {
  const response = await apiClient.get(`/analytics/dashboard?period=${period}`);
  return (response as { data: DashboardData }).data;
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', '30d'],
    queryFn: () => fetchDashboard('30d'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-accent-error">Failed to load dashboard data</p>
      </div>
    );
  }

  // Use mock data if API doesn't return data yet
  const dashboardData = data || {
    overview: {
      total_revenue: 150000000,
      revenue_change: 12.5,
      total_orders: 500,
      orders_change: 8.3,
      total_customers: 1200,
      customers_change: 15.2,
      average_order_value: 300000,
      aov_change: 3.1,
    },
    revenue_chart: [],
    top_products: [],
    top_brands: [],
    orders_by_status: {
      pending: 20,
      confirmed: 15,
      processing: 10,
      shipped: 25,
      delivered: 400,
      cancelled: 30,
    },
    recent_orders: [],
    low_stock_products: [],
  };

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your business performance"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          label="Total Revenue"
          value={formatCurrency(dashboardData.overview.total_revenue)}
          change={dashboardData.overview.revenue_change}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatsCard
          label="Total Orders"
          value={formatNumber(dashboardData.overview.total_orders)}
          change={dashboardData.overview.orders_change}
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <StatsCard
          label="Total Customers"
          value={formatNumber(dashboardData.overview.total_customers || 0)}
          change={dashboardData.overview.customers_change}
          icon={<Users className="h-5 w-5" />}
        />
        <StatsCard
          label="Avg. Order Value"
          value={formatCurrency(dashboardData.overview.average_order_value)}
          change={dashboardData.overview.aov_change}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(dashboardData.orders_by_status).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <StatusBadge status={status} />
                    <span className="text-sm font-medium text-text-primary">
                      {count}
                    </span>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.recent_orders && dashboardData.recent_orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-text-tertiary border-b border-border-primary">
                      <th className="pb-3 font-medium">Order #</th>
                      <th className="pb-3 font-medium">Customer</th>
                      <th className="pb-3 font-medium">Total</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recent_orders.slice(0, 5).map((order: Order) => (
                      <tr
                        key={order.id}
                        className="border-b border-border-subtle"
                      >
                        <td className="py-3 font-medium">
                          {order.order_number}
                        </td>
                        <td className="py-3">{order.customer.full_name}</td>
                        <td className="py-3">{formatCurrency(order.total)}</td>
                        <td className="py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-3 text-text-tertiary">
                          {formatRelativeTime(order.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-text-muted">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent orders</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.top_products && dashboardData.top_products.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.top_products.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <span className="text-sm text-text-muted w-5">
                      {index + 1}.
                    </span>
                    <div className="w-10 h-10 bg-background-secondary rounded flex items-center justify-center">
                      <Package className="h-5 w-5 text-text-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {product.total_sold} sold
                      </p>
                    </div>
                    <span className="text-sm font-medium text-text-primary">
                      {formatCurrency(product.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-muted">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No product data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-accent-warning" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.low_stock_products &&
            dashboardData.low_stock_products.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.low_stock_products.slice(0, 5).map((product: Product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {product.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        SKU: {product.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-accent-warning">
                        {product.stock_quantity} left
                      </p>
                      <p className="text-xs text-text-muted">
                        Threshold: {product.low_stock_threshold}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-muted">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No low stock alerts</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
