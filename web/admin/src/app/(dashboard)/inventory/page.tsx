'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  inventoryService,
  StockSyncStatus,
} from '@shared/services/inventory.service';
import { useUIStore } from '@shared/stores/uiStore';
import { formatDate } from '@shared/lib/utils';
import { PageHeader } from '@shared/components/layouts/PageHeader';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/Badge';
import { Spinner } from '@shared/components/ui/Spinner';
import { Tabs } from '@shared/components/ui/Tabs';
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['inventory', 'summary'],
    queryFn: () => inventoryService.getSummary(),
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['inventory', 'alerts'],
    queryFn: () => inventoryService.getAlerts(),
  });

  const { data: syncStatus, isLoading: syncStatusLoading } = useQuery({
    queryKey: ['inventory', 'sync-status'],
    queryFn: () => inventoryService.getSyncStatus(),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const { data: syncLogs } = useQuery({
    queryKey: ['inventory', 'sync-logs'],
    queryFn: () => inventoryService.getSyncLogs(),
  });

  const triggerSyncMutation = useMutation({
    mutationFn: (brandId: string) => inventoryService.triggerSync(brandId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      addToast('Sync started successfully', 'success');
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to start sync', 'error');
    },
  });

  const triggerSyncAllMutation = useMutation({
    mutationFn: () => inventoryService.triggerSyncAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      addToast('Sync started for all brands', 'success');
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to start sync', 'error');
    },
  });

  const handleExport = async () => {
    try {
      const blob = await inventoryService.exportInventory(undefined, 'csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      addToast('Export started', 'success');
    } catch {
      addToast('Failed to export inventory', 'error');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'sync', label: 'Stock Sync' },
    { id: 'logs', label: 'Sync Logs' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Management"
        description="Monitor and sync stock across all brands"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExport}>
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => triggerSyncAllMutation.mutate()}
              isLoading={triggerSyncAllMutation.isPending}
            >
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              Sync All
            </Button>
          </div>
        }
      />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-sm text-neutral-500">Total Products</div>
              <div className="text-2xl font-semibold text-neutral-900 mt-1">
                {summaryLoading ? '-' : summary?.total_products.toLocaleString()}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-neutral-500">In Stock</div>
              <div className="text-2xl font-semibold text-success-600 mt-1">
                {summaryLoading ? '-' : summary?.in_stock.toLocaleString()}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-neutral-500">Low Stock</div>
              <div className="text-2xl font-semibold text-warning-600 mt-1">
                {summaryLoading ? '-' : summary?.low_stock.toLocaleString()}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-neutral-500">Out of Stock</div>
              <div className="text-2xl font-semibold text-error-600 mt-1">
                {summaryLoading ? '-' : summary?.out_of_stock.toLocaleString()}
              </div>
            </Card>
          </div>

          {/* Alerts */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Inventory Alerts
            </h2>
            {alertsLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : alerts && alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.slice(0, 10).map((alert, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      alert.type === 'out_of_stock'
                        ? 'bg-error-50 border border-error-200'
                        : 'bg-warning-50 border border-warning-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ExclamationTriangleIcon
                        className={`w-5 h-5 ${
                          alert.type === 'out_of_stock'
                            ? 'text-error-600'
                            : 'text-warning-600'
                        }`}
                      />
                      <div>
                        <p className="font-medium text-neutral-900">
                          {alert.product_name}
                        </p>
                        <p className="text-sm text-neutral-600">
                          SKU: {alert.sku}
                          {alert.variant && ` • ${alert.variant}`}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={alert.type === 'out_of_stock' ? 'error' : 'warning'}
                    >
                      {alert.type === 'out_of_stock'
                        ? 'Out of Stock'
                        : `Low: ${alert.current_stock}`}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <CheckCircleIcon className="w-12 h-12 text-success-400 mx-auto mb-2" />
                <p>No inventory alerts</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'sync' && (
        <Card>
          {syncStatusLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                      Brand
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                      Last Sync
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                      Next Sync
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600">
                      Products Synced
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {syncStatus?.map((status) => (
                    <SyncStatusRow
                      key={status.id}
                      status={status}
                      onTriggerSync={() =>
                        triggerSyncMutation.mutate(status.brand_id)
                      }
                      isSyncing={triggerSyncMutation.isPending}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'logs' && (
        <Card>
          {syncLogs && syncLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                      Brand
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                      Started
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                      Completed
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600">
                      Status
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600">
                      Synced
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600">
                      Failed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {syncLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-neutral-100 hover:bg-neutral-50"
                    >
                      <td className="py-3 px-4 font-medium text-neutral-900">
                        {log.brand_name}
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        {formatDate(log.started_at)}
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        {log.completed_at ? formatDate(log.completed_at) : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            log.status === 'completed'
                              ? 'success'
                              : log.status === 'failed'
                              ? 'error'
                              : 'info'
                          }
                        >
                          {log.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center text-neutral-900">
                        {log.products_synced}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {log.products_failed > 0 ? (
                          <span className="text-error-600">{log.products_failed}</span>
                        ) : (
                          <span className="text-neutral-400">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-500">
              <ClockIcon className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
              <p>No sync logs available</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function SyncStatusRow({
  status,
  onTriggerSync,
  isSyncing,
}: {
  status: StockSyncStatus;
  onTriggerSync: () => void;
  isSyncing: boolean;
}) {
  const getStatusBadge = (syncStatus: StockSyncStatus['status']) => {
    switch (syncStatus) {
      case 'syncing':
        return <Badge variant="info">Syncing...</Badge>;
      case 'success':
        return <Badge variant="success">Success</Badge>;
      case 'error':
        return <Badge variant="error">Error</Badge>;
      default:
        return <Badge variant="neutral">Idle</Badge>;
    }
  };

  return (
    <tr className="border-b border-neutral-100 hover:bg-neutral-50">
      <td className="py-3 px-4 font-medium text-neutral-900">
        {status.brand_name}
      </td>
      <td className="py-3 px-4 text-center">{getStatusBadge(status.status)}</td>
      <td className="py-3 px-4 text-neutral-600">
        {status.last_sync_at ? formatDate(status.last_sync_at) : 'Never'}
      </td>
      <td className="py-3 px-4 text-neutral-600">
        {status.next_sync_at ? formatDate(status.next_sync_at) : '-'}
      </td>
      <td className="py-3 px-4 text-center text-neutral-900">
        {status.products_synced || 0}
      </td>
      <td className="py-3 px-4 text-right">
        <Button
          variant="outline"
          size="sm"
          onClick={onTriggerSync}
          disabled={status.status === 'syncing' || isSyncing}
        >
          <ArrowPathIcon
            className={`w-4 h-4 mr-1 ${
              status.status === 'syncing' ? 'animate-spin' : ''
            }`}
          />
          Sync Now
        </Button>
      </td>
    </tr>
  );
}
