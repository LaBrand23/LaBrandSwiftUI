'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@shared/stores/authStore';
import { analyticsService, AnalyticsParams } from '@shared/services/analytics.service';
import { formatCurrency } from '@shared/lib/utils';
import { Card } from '@shared/components/ui/Card';
import { Spinner } from '@shared/components/ui/Spinner';
import { Select } from '@shared/components/ui/Select';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CubeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

type Period = 'today' | 'week' | 'month' | 'quarter' | 'year';

const periodOptions = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'quarter', label: 'Last 3 Months' },
  { value: 'year', label: 'Last Year' },
];

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
              <span>{Math.abs(change).toFixed(1)}% vs previous period</span>
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

function RevenueChart({ data }: { data: Array<{ date: string; revenue: number; orders: number }> }) {
  if (!data.length) return null;

  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <div className="h-64 flex items-end gap-1">
      {data.map((item, idx) => {
        const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
        return (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full bg-primary-500 rounded-t hover:bg-primary-600 transition-colors cursor-pointer group relative"
              style={{ height: `${Math.max(height, 2)}%` }}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {formatCurrency(item.revenue)}
              </div>
            </div>
            <span className="text-xs text-neutral-500 truncate w-full text-center">
              {new Date(item.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const brandId = user?.brand_assignment?.brand_id;
  const [period, setPeriod] = useState<Period>('month');

  const params: AnalyticsParams = {
    brand_id: brandId,
    period,
  };

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['brand-analytics', params],
    queryFn: () => analyticsService.getDashboard(params),
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Analytics</h1>
          <p className="text-neutral-500 mt-1">
            Track your brand performance
          </p>
        </div>
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          options={periodOptions}
          className="w-40"
        />
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
          title="Products Sold"
          value={dashboardData?.top_products?.reduce((acc, p) => acc + p.total_sold, 0) || 0}
          icon={CubeIcon}
        />
        <StatCard
          title="Avg Order Value"
          value={dashboardData?.overview.average_order_value || 0}
          change={dashboardData?.overview.aov_change}
          icon={ChartBarIcon}
          format="currency"
        />
      </div>

      {/* Revenue Chart */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Revenue Trend
        </h2>
        {dashboardData?.revenue_chart && dashboardData.revenue_chart.length > 0 ? (
          <RevenueChart data={dashboardData.revenue_chart} />
        ) : (
          <div className="h-64 flex items-center justify-center text-neutral-500">
            No data available for this period
          </div>
        )}
      </Card>

      {/* Orders by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Orders by Status
          </h2>
          {dashboardData?.orders_by_status ? (
            <div className="space-y-4">
              {Object.entries(dashboardData.orders_by_status).map(([status, count]) => {
                const total = Object.values(dashboardData.orders_by_status).reduce(
                  (a, b) => a + b,
                  0
                );
                const percentage = total > 0 ? (count / total) * 100 : 0;

                const statusConfig: Record<string, { label: string; color: string }> = {
                  pending: { label: 'Pending', color: 'bg-warning-500' },
                  confirmed: { label: 'Confirmed', color: 'bg-info-500' },
                  processing: { label: 'Processing', color: 'bg-primary-500' },
                  shipped: { label: 'Shipped', color: 'bg-secondary-500' },
                  delivered: { label: 'Delivered', color: 'bg-success-500' },
                  cancelled: { label: 'Cancelled', color: 'bg-error-500' },
                };

                const config = statusConfig[status];
                if (!config || count === 0) return null;

                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">{config.label}</span>
                      <span className="font-medium text-neutral-900">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${config.color} rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">No data</div>
          )}
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Top Products
          </h2>
          {dashboardData?.top_products && dashboardData.top_products.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.top_products.slice(0, 5).map((product, idx) => (
                <div key={product.id} className="flex items-center gap-4">
                  <span className="text-sm text-neutral-500 w-6">{idx + 1}</span>
                  <div className="w-10 h-10 bg-neutral-100 rounded overflow-hidden">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {product.total_sold} sold
                    </p>
                  </div>
                  <p className="font-medium text-neutral-900">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">No data</div>
          )}
        </Card>
      </div>
    </div>
  );
}
