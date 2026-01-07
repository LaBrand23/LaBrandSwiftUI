'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService, AnalyticsParams } from '@shared/services/analytics.service';
import { formatCurrency } from '@shared/lib/utils';
import { PageHeader } from '@shared/components/layouts/PageHeader';
import { Button } from '@shared/components/ui/Button';
import { Card } from '@shared/components/ui/Card';
import { Spinner } from '@shared/components/ui/Spinner';
import { Select } from '@shared/components/ui/Select';
import { Tabs } from '@shared/components/ui/Tabs';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
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
  format?: 'number' | 'currency' | 'percentage';
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500">{title}</p>
          <p className="text-2xl font-semibold text-neutral-900 mt-1">
            {formatValue(value)}
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
          <div
            key={idx}
            className="flex-1 flex flex-col items-center gap-2"
          >
            <div
              className="w-full bg-primary-500 rounded-t hover:bg-primary-600 transition-colors cursor-pointer group relative"
              style={{ height: `${Math.max(height, 2)}%` }}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {formatCurrency(item.revenue)}
                <br />
                {item.orders} orders
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

function OrdersByStatusChart({ data }: { data: Record<string, number> }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'bg-warning-500' },
    confirmed: { label: 'Confirmed', color: 'bg-info-500' },
    processing: { label: 'Processing', color: 'bg-primary-500' },
    shipped: { label: 'Shipped', color: 'bg-secondary-500' },
    delivered: { label: 'Delivered', color: 'bg-success-500' },
    cancelled: { label: 'Cancelled', color: 'bg-error-500' },
  };

  const total = Object.values(data).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-4">
      {Object.entries(data).map(([status, count]) => {
        const config = statusConfig[status];
        if (!config || count === 0) return null;

        const percentage = total > 0 ? (count / total) * 100 : 0;

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
                className={`h-full ${config.color} rounded-full transition-all`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TopProductsTable({
  products,
}: {
  products: Array<{
    id: string;
    name: string;
    image_url?: string;
    total_sold: number;
    revenue: number;
  }>;
}) {
  return (
    <div className="divide-y divide-neutral-100">
      {products.map((product, idx) => (
        <div key={product.id} className="flex items-center gap-4 py-3">
          <span className="text-sm text-neutral-500 w-6">{idx + 1}</span>
          <div className="w-10 h-10 bg-neutral-100 rounded overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                <ShoppingBagIcon className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-neutral-900 truncate">{product.name}</p>
            <p className="text-sm text-neutral-500">{product.total_sold} sold</p>
          </div>
          <div className="text-right">
            <p className="font-medium text-neutral-900">
              {formatCurrency(product.revenue)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TopBrandsTable({
  brands,
}: {
  brands: Array<{
    id: string;
    name: string;
    logo_url?: string;
    total_orders: number;
    revenue: number;
  }>;
}) {
  return (
    <div className="divide-y divide-neutral-100">
      {brands.map((brand, idx) => (
        <div key={brand.id} className="flex items-center gap-4 py-3">
          <span className="text-sm text-neutral-500 w-6">{idx + 1}</span>
          <div className="w-10 h-10 bg-neutral-100 rounded overflow-hidden">
            {brand.logo_url ? (
              <img
                src={brand.logo_url}
                alt={brand.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-neutral-400">
                {brand.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-neutral-900 truncate">{brand.name}</p>
            <p className="text-sm text-neutral-500">{brand.total_orders} orders</p>
          </div>
          <div className="text-right">
            <p className="font-medium text-neutral-900">
              {formatCurrency(brand.revenue)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('month');
  const [activeTab, setActiveTab] = useState('overview');

  const params: AnalyticsParams = { period };

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['analytics', 'dashboard', params],
    queryFn: () => analyticsService.getDashboard(params),
  });

  const handleExport = async (type: 'sales' | 'orders' | 'products' | 'customers') => {
    try {
      const blob = await analyticsService.exportReport(type, {
        ...params,
        format: 'csv',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'sales', label: 'Sales' },
    { id: 'products', label: 'Products' },
    { id: 'customers', label: 'Customers' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Track your business performance"
        actions={
          <div className="flex items-center gap-4">
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              options={periodOptions}
              className="w-40"
            />
            <Button variant="outline" onClick={() => handleExport('sales')}>
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              Export
            </Button>
          </div>
        }
      />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : activeTab === 'overview' ? (
        <div className="space-y-6">
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
              icon={ShoppingBagIcon}
            />
            <StatCard
              title="Total Customers"
              value={dashboardData?.overview.total_customers || 0}
              change={dashboardData?.overview.customers_change}
              icon={UsersIcon}
            />
            <StatCard
              title="Avg Order Value"
              value={dashboardData?.overview.average_order_value || 0}
              change={dashboardData?.overview.aov_change}
              icon={ChartBarIcon}
              format="currency"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Revenue Trend
              </h3>
              {dashboardData?.revenue_chart && (
                <RevenueChart data={dashboardData.revenue_chart} />
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Orders by Status
              </h3>
              {dashboardData?.orders_by_status && (
                <OrdersByStatusChart data={dashboardData.orders_by_status} />
              )}
            </Card>
          </div>

          {/* Top Products & Brands */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Top Products
              </h3>
              {dashboardData?.top_products && (
                <TopProductsTable products={dashboardData.top_products} />
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Top Brands
              </h3>
              {dashboardData?.top_brands && (
                <TopBrandsTable brands={dashboardData.top_brands} />
              )}
            </Card>
          </div>

          {/* Inventory Alerts */}
          {dashboardData?.inventory_alerts && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Inventory Alerts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
                  <div className="text-2xl font-bold text-error-600">
                    {dashboardData.inventory_alerts.out_of_stock}
                  </div>
                  <div className="text-sm text-error-700">Out of Stock Products</div>
                </div>
                <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                  <div className="text-2xl font-bold text-warning-600">
                    {dashboardData.inventory_alerts.low_stock}
                  </div>
                  <div className="text-sm text-warning-700">Low Stock Products</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      ) : activeTab === 'sales' ? (
        <SalesTab period={period} />
      ) : activeTab === 'products' ? (
        <ProductsTab period={period} />
      ) : (
        <CustomersTab period={period} />
      )}
    </div>
  );
}

function SalesTab({ period }: { period: Period }) {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'sales-report', period],
    queryFn: () => analyticsService.getSalesReport({ period }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Total Orders</div>
          <div className="text-2xl font-semibold text-neutral-900 mt-1">
            {data?.total_orders.toLocaleString() || 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Total Revenue</div>
          <div className="text-2xl font-semibold text-neutral-900 mt-1">
            {formatCurrency(data?.total_revenue || 0)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Avg Order Value</div>
          <div className="text-2xl font-semibold text-neutral-900 mt-1">
            {formatCurrency(data?.average_order_value || 0)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Items Sold</div>
          <div className="text-2xl font-semibold text-neutral-900 mt-1">
            {data?.total_items_sold.toLocaleString() || 0}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Sales by Brand
          </h3>
          <div className="space-y-4">
            {data?.by_brand.map((item) => (
              <div key={item.brand_id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-900">{item.brand_name}</p>
                  <p className="text-sm text-neutral-500">{item.orders} orders</p>
                </div>
                <p className="font-semibold text-neutral-900">
                  {formatCurrency(item.revenue)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Sales by Category
          </h3>
          <div className="space-y-4">
            {data?.by_category.map((item) => (
              <div key={item.category_id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-900">{item.category_name}</p>
                  <p className="text-sm text-neutral-500">{item.orders} orders</p>
                </div>
                <p className="font-semibold text-neutral-900">
                  {formatCurrency(item.revenue)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ProductsTab({ period }: { period: Period }) {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'top-products', period],
    queryFn: () => analyticsService.getTopProducts({ period, limit: 20 }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                Rank
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                Product
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                Units Sold
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.map((product, idx) => (
              <tr
                key={product.id}
                className="border-b border-neutral-100 hover:bg-neutral-50"
              >
                <td className="py-3 px-4 text-sm text-neutral-500">{idx + 1}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-100 rounded overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <ShoppingBagIcon className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-neutral-900">
                      {product.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right text-neutral-600">
                  {product.total_sold.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right font-medium text-neutral-900">
                  {formatCurrency(product.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function CustomersTab({ period }: { period: Period }) {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'customers-report', period],
    queryFn: () => analyticsService.getCustomersReport({ period }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Total Customers</div>
          <div className="text-2xl font-semibold text-neutral-900 mt-1">
            {data?.total_customers.toLocaleString() || 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">New Customers</div>
          <div className="text-2xl font-semibold text-success-600 mt-1">
            {data?.new_customers.toLocaleString() || 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Returning Customers</div>
          <div className="text-2xl font-semibold text-primary-600 mt-1">
            {data?.returning_customers.toLocaleString() || 0}
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-neutral-100">
          <h3 className="font-semibold text-neutral-900">Top Customers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                  Customer
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                  Orders
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                  Total Spent
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.top_customers.map((customer) => (
                <tr
                  key={customer.user_id}
                  className="border-b border-neutral-100 hover:bg-neutral-50"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-neutral-900">
                        {customer.full_name}
                      </p>
                      <p className="text-sm text-neutral-500">{customer.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-neutral-600">
                    {customer.total_orders}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-neutral-900">
                    {formatCurrency(customer.total_spent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
