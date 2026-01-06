'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { integrationsService, ADAPTER_CONFIGS } from '@shared/services/integrations.service';
import { CRMIntegration, SyncLog, SKUMapping, AdapterType, SyncStatus } from '@shared/types';
import { useUIStore } from '@shared/stores/uiStore';
import { formatDate } from '@shared/lib/utils';
import PageHeader from '@shared/components/layouts/PageHeader';
import Button from '@shared/components/ui/Button';
import Card from '@shared/components/ui/Card';
import Badge from '@shared/components/ui/Badge';
import Spinner from '@shared/components/ui/Spinner';
import Input from '@shared/components/ui/Input';
import Select from '@shared/components/ui/Select';
import Modal from '@shared/components/ui/Modal';
import Tabs from '@shared/components/ui/Tabs';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ServerIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  CloudArrowUpIcon,
  PlayIcon,
  PauseIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';

const syncStatusBadgeVariant: Record<SyncStatus, 'success' | 'warning' | 'error' | 'neutral' | 'info'> = {
  pending: 'neutral',
  running: 'info',
  success: 'success',
  partial: 'warning',
  failed: 'error',
};

const adapterIcons: Record<AdapterType, typeof ServerIcon> = {
  billz: ServerIcon,
  '1c': DocumentTextIcon,
  loyverse: GlobeAltIcon,
  csv: CloudArrowUpIcon,
  webhook: GlobeAltIcon,
  custom: Cog6ToothIcon,
};

export default function IntegrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  const integrationId = params.id as string;

  const [activeTab, setActiveTab] = useState('overview');
  const [deleteModal, setDeleteModal] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const { data: integration, isLoading } = useQuery({
    queryKey: ['integration', integrationId],
    queryFn: () => integrationsService.getById(integrationId),
    enabled: !!integrationId,
  });

  const { data: stats } = useQuery({
    queryKey: ['integration-stats', integrationId],
    queryFn: () => integrationsService.getStats(integrationId),
    enabled: !!integrationId,
  });

  const { data: logsData } = useQuery({
    queryKey: ['integration-logs', integrationId],
    queryFn: () => integrationsService.getSyncLogs({ integration_id: integrationId, limit: 10 }),
    enabled: !!integrationId,
  });

  const { data: mappingsData } = useQuery({
    queryKey: ['integration-mappings', integrationId],
    queryFn: () => integrationsService.getSKUMappings(integrationId, { limit: 50 }),
    enabled: !!integrationId && activeTab === 'mappings',
  });

  const syncMutation = useMutation({
    mutationFn: () => integrationsService.triggerSync(integrationId),
    onSuccess: (result) => {
      addToast(result.message || 'Sync started', 'success');
      queryClient.invalidateQueries({ queryKey: ['integration', integrationId] });
      queryClient.invalidateQueries({ queryKey: ['integration-logs', integrationId] });
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to start sync', 'error');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (isActive: boolean) => integrationsService.toggleActive(integrationId, isActive),
    onSuccess: (_, isActive) => {
      addToast(`Integration ${isActive ? 'activated' : 'deactivated'}`, 'success');
      queryClient.invalidateQueries({ queryKey: ['integration', integrationId] });
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to update integration', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => integrationsService.delete(integrationId),
    onSuccess: () => {
      addToast('Integration deleted', 'success');
      router.push('/settings/integrations');
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to delete integration', 'error');
    },
  });

  const autoMapMutation = useMutation({
    mutationFn: () => integrationsService.autoMapSKUs(integrationId),
    onSuccess: (result) => {
      addToast(`Mapped ${result.mapped} SKUs. ${result.unmapped} remaining.`, 'success');
      queryClient.invalidateQueries({ queryKey: ['integration-mappings', integrationId] });
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to auto-map SKUs', 'error');
    },
  });

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await integrationsService.testConnection(integrationId);
      setTestResult(result);
    } catch {
      setTestResult({ success: false, message: 'Connection test failed' });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!integration) {
    return (
      <div className="text-center py-12">
        <ServerIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 mb-2">Integration not found</h3>
        <p className="text-neutral-500 mb-4">The integration you're looking for doesn't exist.</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const AdapterIcon = adapterIcons[integration.adapter_type] || ServerIcon;
  const adapterConfig = ADAPTER_CONFIGS[integration.adapter_type];
  const logs = logsData?.logs || [];
  const mappings = mappingsData?.mappings || [];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'logs', label: 'Sync Logs' },
    { id: 'mappings', label: 'SKU Mappings' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={integration.name}
        subtitle={`${adapterConfig?.label || integration.adapter_type} integration`}
        breadcrumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Integrations', href: '/settings/integrations' },
          { label: integration.name },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={() => syncMutation.mutate()}
              isLoading={syncMutation.isPending}
              disabled={integration.status === 'pending_setup'}
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Sync Now
            </Button>
            <Button
              variant={integration.is_active ? 'outline' : 'primary'}
              onClick={() => toggleMutation.mutate(!integration.is_active)}
            >
              {integration.is_active ? (
                <>
                  <PauseIcon className="w-4 h-4 mr-2" />
                  Disable
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4 mr-2" />
                  Enable
                </>
              )}
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <Card className="p-1">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-lg bg-primary-50 flex items-center justify-center">
                    <AdapterIcon className="w-7 h-7 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">
                      {integration.name}
                    </h2>
                    <p className="text-neutral-500">{adapterConfig?.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge
                        variant={
                          integration.status === 'active'
                            ? 'success'
                            : integration.status === 'error'
                            ? 'error'
                            : 'warning'
                        }
                      >
                        {integration.status.replace('_', ' ')}
                      </Badge>
                      {integration.is_active ? (
                        <Badge variant="success">Enabled</Badge>
                      ) : (
                        <Badge variant="neutral">Disabled</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-500">Last Sync</p>
                  <p className="font-semibold text-neutral-900 mt-1">
                    {integration.last_sync_at
                      ? formatDate(integration.last_sync_at)
                      : 'Never'}
                  </p>
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-500">Sync Status</p>
                  <div className="mt-1">
                    {integration.last_sync_status ? (
                      <Badge
                        variant={syncStatusBadgeVariant[integration.last_sync_status]}
                      >
                        {integration.last_sync_status}
                      </Badge>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-500">Sync Interval</p>
                  <p className="font-semibold text-neutral-900 mt-1">
                    {integration.sync_interval_minutes} min
                  </p>
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-500">Total Syncs</p>
                  <p className="font-semibold text-neutral-900 mt-1">
                    {stats?.total_syncs || 0}
                  </p>
                </div>
              </div>
            </Card>

            {/* Stats */}
            {stats && (
              <Card className="p-6">
                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5" />
                  Sync Statistics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-success-50 rounded-lg">
                    <p className="text-sm text-success-700">Successful</p>
                    <p className="text-2xl font-semibold text-success-900 mt-1">
                      {stats.successful_syncs}
                    </p>
                  </div>
                  <div className="p-4 bg-error-50 rounded-lg">
                    <p className="text-sm text-error-700">Failed</p>
                    <p className="text-2xl font-semibold text-error-900 mt-1">
                      {stats.failed_syncs}
                    </p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-500">Products Synced</p>
                    <p className="text-2xl font-semibold text-neutral-900 mt-1">
                      {stats.products_synced}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Recent Logs */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-neutral-900">Recent Sync Logs</h3>
                <Link href={`/settings/integrations/${integrationId}/logs`}>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              {logs.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">
                  No sync logs yet
                </p>
              ) : (
                <div className="space-y-3">
                  {logs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {log.status === 'success' ? (
                          <CheckCircleIcon className="w-5 h-5 text-success-500" />
                        ) : log.status === 'failed' ? (
                          <ExclamationCircleIcon className="w-5 h-5 text-error-500" />
                        ) : (
                          <ClockIcon className="w-5 h-5 text-warning-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-neutral-900">
                            {formatDate(log.started_at)}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {log.products_updated} updated, {log.products_failed} failed
                          </p>
                        </div>
                      </div>
                      <Badge variant={syncStatusBadgeVariant[log.status]} size="sm">
                        {log.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Test Connection */}
            <Card className="p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">Test Connection</h3>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleTestConnection}
                isLoading={isTesting}
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Test Connection
              </Button>
              {testResult && (
                <div
                  className={`mt-4 p-3 rounded-lg ${
                    testResult.success
                      ? 'bg-success-50 border border-success-200'
                      : 'bg-error-50 border border-error-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {testResult.success ? (
                      <CheckCircleIcon className="w-5 h-5 text-success-600 mt-0.5" />
                    ) : (
                      <ExclamationTriangleIcon className="w-5 h-5 text-error-600 mt-0.5" />
                    )}
                    <p
                      className={`text-sm ${
                        testResult.success ? 'text-success-700' : 'text-error-700'
                      }`}
                    >
                      {testResult.message}
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* Branch Info */}
            <Card className="p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">Connection Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Brand</span>
                  <span className="font-medium text-neutral-900">
                    {integration.brand?.name || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Branch</span>
                  <span className="font-medium text-neutral-900">
                    {integration.branch?.name || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Adapter</span>
                  <span className="font-medium text-neutral-900">
                    {adapterConfig?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Created</span>
                  <span className="font-medium text-neutral-900">
                    {formatDate(integration.created_at)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="p-6 border-error-200">
              <h3 className="font-semibold text-error-600 mb-4">Danger Zone</h3>
              <Button
                variant="outline"
                className="w-full text-error-600 border-error-300 hover:bg-error-50"
                onClick={() => setDeleteModal(true)}
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete Integration
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <Card>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900">Sync History</h3>
              <Link href={`/settings/integrations/${integrationId}/logs`}>
                <Button variant="outline" size="sm">
                  View Full Logs
                </Button>
              </Link>
            </div>
          </div>
          {logs.length === 0 ? (
            <div className="p-12 text-center">
              <DocumentTextIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">No sync logs available</p>
            </div>
          ) : (
            <div className="divide-y">
              {logs.map((log) => (
                <div key={log.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {log.status === 'success' ? (
                        <CheckCircleIcon className="w-5 h-5 text-success-500 mt-0.5" />
                      ) : log.status === 'failed' ? (
                        <ExclamationCircleIcon className="w-5 h-5 text-error-500 mt-0.5" />
                      ) : log.status === 'running' ? (
                        <ArrowPathIcon className="w-5 h-5 text-info-500 mt-0.5 animate-spin" />
                      ) : (
                        <ClockIcon className="w-5 h-5 text-warning-500 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium text-neutral-900">
                          {formatDate(log.started_at)}
                        </p>
                        <p className="text-sm text-neutral-500">
                          Processed: {log.products_processed} | Updated:{' '}
                          {log.products_updated} | Created: {log.products_created} |
                          Failed: {log.products_failed}
                        </p>
                        {log.duration_ms && (
                          <p className="text-xs text-neutral-400 mt-1">
                            Duration: {(log.duration_ms / 1000).toFixed(2)}s
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={syncStatusBadgeVariant[log.status]}>
                      {log.status}
                    </Badge>
                  </div>
                  {log.errors && log.errors.length > 0 && (
                    <div className="mt-3 p-3 bg-error-50 rounded-lg">
                      <p className="text-sm font-medium text-error-700 mb-2">
                        Errors ({log.errors.length})
                      </p>
                      <ul className="text-sm text-error-600 space-y-1">
                        {log.errors.slice(0, 3).map((err, idx) => (
                          <li key={idx}>
                            {err.sku && <span className="font-mono">[{err.sku}]</span>}{' '}
                            {err.message}
                          </li>
                        ))}
                        {log.errors.length > 3 && (
                          <li className="text-error-500">
                            ...and {log.errors.length - 3} more errors
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Mappings Tab */}
      {activeTab === 'mappings' && (
        <Card>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-neutral-900">SKU Mappings</h3>
                <p className="text-sm text-neutral-500">
                  Map external SKUs to your products
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => autoMapMutation.mutate()}
                isLoading={autoMapMutation.isPending}
              >
                <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                Auto-Map SKUs
              </Button>
            </div>
          </div>
          {mappings.length === 0 ? (
            <div className="p-12 text-center">
              <LinkIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500 mb-4">No SKU mappings configured</p>
              <p className="text-sm text-neutral-400">
                Run a sync to import external SKUs, then map them to your products.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                      External SKU
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                      Mapped Product
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
                  {mappings.map((mapping) => (
                    <tr key={mapping.id} className="border-b hover:bg-neutral-50">
                      <td className="py-3 px-4">
                        <code className="text-sm bg-neutral-100 px-2 py-1 rounded">
                          {mapping.external_sku}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        {mapping.product_name ? (
                          <div>
                            <p className="text-sm font-medium text-neutral-900">
                              {mapping.product_name}
                            </p>
                            {mapping.variant_name && (
                              <p className="text-xs text-neutral-500">
                                {mapping.variant_name}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-400">Not mapped</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {mapping.is_ignored ? (
                          <Badge variant="neutral" size="sm">
                            Ignored
                          </Badge>
                        ) : mapping.product_id ? (
                          <Badge variant="success" size="sm">
                            Mapped
                          </Badge>
                        ) : (
                          <Badge variant="warning" size="sm">
                            Unmapped
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-neutral-900 mb-4">
              Configuration
            </h3>
            <div className="space-y-4">
              {adapterConfig?.fields.map((field) => {
                const value = integration.config[field.key];
                if (field.type === 'password') {
                  return (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        {field.label}
                      </label>
                      <p className="text-neutral-500">••••••••</p>
                    </div>
                  );
                }
                return (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      {field.label}
                    </label>
                    <p className="text-neutral-900">
                      {field.type === 'checkbox'
                        ? value
                          ? 'Enabled'
                          : 'Disabled'
                        : (value as string) || '-'}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-neutral-900 mb-4">
              Sync Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Sync Interval
                </label>
                <p className="text-neutral-900">
                  Every {integration.sync_interval_minutes} minutes
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Auto Sync
                </label>
                <p className="text-neutral-900">
                  {integration.is_active ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Integration"
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            Are you sure you want to delete <strong>{integration.name}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteMutation.mutate()}
              isLoading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
