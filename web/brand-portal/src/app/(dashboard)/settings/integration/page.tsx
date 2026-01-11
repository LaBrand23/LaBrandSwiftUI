'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationsService, ADAPTER_CONFIGS } from '@shared/services/integrations.service';
import { CRMIntegration, SyncStatus, AdapterType } from '@shared/types';
import { useAuthStore } from '@shared/stores/authStore';
import { useUIStore } from '@shared/stores/uiStore';
import { formatDate } from '@shared/lib/utils';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/Badge';
import { Spinner } from '@shared/components/ui/Spinner';
import { Modal } from '@shared/components/ui/Modal';
import { Select } from '@shared/components/ui/Select';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ServerIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  LinkIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
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

export default function IntegrationSettingsPage() {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();
  const branchId = user?.brand_assignment?.branch_id;

  const [requestModal, setRequestModal] = useState(false);
  const [requestData, setRequestData] = useState({
    adapter_type: '' as AdapterType | '',
    notes: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['brand-integrations', branchId],
    queryFn: () => integrationsService.getBrandIntegrations({ branch_id: branchId }),
    enabled: !!user?.brand_assignment,
  });

  const { data: logsData } = useQuery({
    queryKey: ['brand-sync-logs'],
    queryFn: () => integrationsService.getBrandSyncLogs(undefined, { limit: 10 }),
    enabled: !!user?.brand_assignment,
  });

  const syncMutation = useMutation({
    mutationFn: (id: string) => integrationsService.triggerBrandSync(id),
    onSuccess: (result) => {
      addToast({ type: 'success', title: result.message || 'Sync started' });
      queryClient.invalidateQueries({ queryKey: ['brand-integrations'] });
      queryClient.invalidateQueries({ queryKey: ['brand-sync-logs'] });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: error.message || 'Failed to start sync' });
    },
  });

  const requestMutation = useMutation({
    mutationFn: () =>
      integrationsService.requestIntegration({
        branch_id: branchId!,
        adapter_type: requestData.adapter_type as AdapterType,
        notes: requestData.notes,
      }),
    onSuccess: (result) => {
      addToast({ type: 'success', title: result.message || 'Integration request submitted' });
      setRequestModal(false);
      setRequestData({ adapter_type: '', notes: '' });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: error.message || 'Failed to submit request' });
    },
  });

  const integrations = data?.integrations || [];
  const logs = logsData?.logs || [];
  const activeIntegration = integrations.find((i) => i.is_active);

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
        <h1 className="text-2xl font-semibold text-neutral-900">
          Stock Integration
        </h1>
        <p className="text-neutral-500 mt-1">
          Manage your CRM/POS integration for automatic inventory sync
        </p>
      </div>

      {/* No Integration Setup */}
      {integrations.length === 0 ? (
        <Card className="p-8">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <LinkIcon className="w-8 h-8 text-neutral-400" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">
              No Integration Configured
            </h2>
            <p className="text-neutral-500 mb-6">
              Connect your CRM or POS system to automatically sync inventory
              levels with LaBrand.
            </p>
            <Button onClick={() => setRequestModal(true)}>
              <PaperAirplaneIcon className="w-4 h-4 mr-2" />
              Request Integration Setup
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Integration */}
            {activeIntegration && (
              <IntegrationCard
                integration={activeIntegration}
                onSync={() => syncMutation.mutate(activeIntegration.id)}
                isSyncing={syncMutation.isPending}
              />
            )}

            {/* Pending/Inactive Integrations */}
            {integrations
              .filter((i) => !i.is_active)
              .map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onSync={() => syncMutation.mutate(integration.id)}
                  isSyncing={false}
                />
              ))}

            {/* Recent Sync Logs */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Recent Sync History
              </h2>
              {logs.length === 0 ? (
                <div className="text-center py-8">
                  <DocumentTextIcon className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                  <p className="text-neutral-500">No sync history yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {log.status === 'success' ? (
                          <CheckCircleIcon className="w-5 h-5 text-success-500" />
                        ) : log.status === 'failed' ? (
                          <ExclamationCircleIcon className="w-5 h-5 text-error-500" />
                        ) : log.status === 'running' ? (
                          <ArrowPathIcon className="w-5 h-5 text-info-500 animate-spin" />
                        ) : (
                          <ClockIcon className="w-5 h-5 text-warning-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-neutral-900">
                            {formatDate(log.started_at)}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {log.products_updated} updated
                            {log.products_failed > 0 && (
                              <span className="text-error-500">
                                , {log.products_failed} failed
                              </span>
                            )}
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
            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="font-semibold text-neutral-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                {activeIntegration && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => syncMutation.mutate(activeIntegration.id)}
                    isLoading={syncMutation.isPending}
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    Sync Now
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setRequestModal(true)}
                >
                  <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                  Request New Integration
                </Button>
              </div>
            </Card>

            {/* Help */}
            <Card className="p-6 bg-info-50 border-info-200">
              <div className="flex items-start gap-3">
                <InformationCircleIcon className="w-5 h-5 text-info-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-info-900">Need Help?</h3>
                  <p className="text-sm text-info-700 mt-1">
                    Contact your administrator if you need assistance with
                    integration setup or encounter sync issues.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Request Integration Modal */}
      <Modal
        isOpen={requestModal}
        onClose={() => setRequestModal(false)}
        title="Request Integration Setup"
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            Submit a request to have an administrator set up an integration for
            your branch.
          </p>

          <Select
            label="Integration Type"
            value={requestData.adapter_type}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setRequestData({
                ...requestData,
                adapter_type: e.target.value as AdapterType,
              })
            }
            options={[
              { value: '', label: 'Select integration type' },
              { value: 'billz', label: 'Billz POS' },
              { value: '1c', label: '1C Enterprise' },
              { value: 'loyverse', label: 'Loyverse' },
              { value: 'csv', label: 'CSV/Excel Import' },
              { value: 'custom', label: 'Other/Custom' },
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Additional Notes
            </label>
            <textarea
              value={requestData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setRequestData({ ...requestData, notes: e.target.value })
              }
              placeholder="Provide any additional details about your integration requirements..."
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setRequestModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => requestMutation.mutate()}
              isLoading={requestMutation.isPending}
              disabled={!requestData.adapter_type}
            >
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function IntegrationCard({
  integration,
  onSync,
  isSyncing,
}: {
  integration: CRMIntegration;
  onSync: () => void;
  isSyncing: boolean;
}) {
  const AdapterIcon = adapterIcons[integration.adapter_type] || ServerIcon;
  const adapterConfig = ADAPTER_CONFIGS[integration.adapter_type];

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
              <AdapterIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                {integration.name}
              </h3>
              <p className="text-sm text-neutral-500">
                {adapterConfig?.label || integration.adapter_type}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {integration.is_active ? (
              <Badge variant="success">Active</Badge>
            ) : (
              <Badge variant="neutral">Inactive</Badge>
            )}
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
          </div>
        </div>

        {/* Status Info */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-3 bg-neutral-50 rounded-lg">
            <p className="text-xs text-neutral-500">Last Sync</p>
            <p className="text-sm font-medium text-neutral-900 mt-0.5">
              {integration.last_sync_at
                ? formatDate(integration.last_sync_at)
                : 'Never'}
            </p>
          </div>
          <div className="p-3 bg-neutral-50 rounded-lg">
            <p className="text-xs text-neutral-500">Sync Status</p>
            <div className="mt-0.5">
              {integration.last_sync_status ? (
                <Badge
                  variant={syncStatusBadgeVariant[integration.last_sync_status]}
                  size="sm"
                >
                  {integration.last_sync_status}
                </Badge>
              ) : (
                <span className="text-sm text-neutral-400">-</span>
              )}
            </div>
          </div>
          <div className="p-3 bg-neutral-50 rounded-lg">
            <p className="text-xs text-neutral-500">Auto Sync</p>
            <p className="text-sm font-medium text-neutral-900 mt-0.5">
              Every {integration.sync_interval_minutes} min
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {integration.status === 'error' && (
          <div className="p-3 bg-error-50 border border-error-200 rounded-lg mb-4">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-error-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-error-700">
                  Integration Error
                </p>
                <p className="text-sm text-error-600">
                  There was an issue with the last sync. Please contact your
                  administrator.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {integration.is_active && (
          <Button
            variant="outline"
            onClick={onSync}
            isLoading={isSyncing}
            disabled={integration.status === 'pending_setup'}
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Sync Now
          </Button>
        )}
      </div>
    </Card>
  );
}
