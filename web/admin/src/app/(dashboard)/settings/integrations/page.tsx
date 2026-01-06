'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { integrationsService, ADAPTER_CONFIGS } from '@shared/services/integrations.service';
import { CRMIntegration, AdapterType, IntegrationStatus, SyncStatus } from '@shared/types';
import { useUIStore } from '@shared/stores/uiStore';
import { formatDate } from '@shared/lib/utils';
import PageHeader from '@shared/components/layouts/PageHeader';
import Button from '@shared/components/ui/Button';
import Card from '@shared/components/ui/Card';
import Badge from '@shared/components/ui/Badge';
import Spinner from '@shared/components/ui/Spinner';
import Modal from '@shared/components/ui/Modal';
import Select from '@shared/components/ui/Select';
import {
  PlusIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  XCircleIcon,
  ServerIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  BuildingStorefrontIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const statusBadgeVariant: Record<IntegrationStatus, 'success' | 'warning' | 'error' | 'neutral'> = {
  active: 'success',
  inactive: 'neutral',
  error: 'error',
  pending_setup: 'warning',
};

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

export default function IntegrationsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['integrations', { brand_id: brandFilter, status: statusFilter }],
    queryFn: () => integrationsService.getAll({
      brand_id: brandFilter || undefined,
      status: statusFilter as IntegrationStatus || undefined,
    }),
  });

  const syncMutation = useMutation({
    mutationFn: (id: string) => integrationsService.triggerSync(id),
    onSuccess: (result) => {
      addToast(result.message || 'Sync started', 'success');
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to start sync', 'error');
    },
    onSettled: () => {
      setSyncingId(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      integrationsService.toggleActive(id, isActive),
    onSuccess: (_, { isActive }) => {
      addToast(`Integration ${isActive ? 'activated' : 'deactivated'}`, 'success');
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to update integration', 'error');
    },
  });

  const handleSync = (id: string) => {
    setSyncingId(id);
    syncMutation.mutate(id);
  };

  const integrations = data?.integrations || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM Integrations"
        subtitle="Manage stock sync integrations with external CRM/POS systems"
        breadcrumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Integrations' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Link href="/settings">
              <Button variant="outline">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Settings
              </Button>
            </Link>
            <Link href="/settings/integrations/new">
              <Button>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Integration
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Total Integrations</div>
          <div className="text-2xl font-semibold text-neutral-900 mt-1">
            {integrations.length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Active</div>
          <div className="text-2xl font-semibold text-success-600 mt-1">
            {integrations.filter((i) => i.status === 'active').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Errors</div>
          <div className="text-2xl font-semibold text-error-600 mt-1">
            {integrations.filter((i) => i.status === 'error').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Pending Setup</div>
          <div className="text-2xl font-semibold text-warning-600 mt-1">
            {integrations.filter((i) => i.status === 'pending_setup').length}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'error', label: 'Error' },
              { value: 'pending_setup', label: 'Pending Setup' },
            ]}
            className="w-40"
          />
          <Link href="/settings/integrations/logs" className="ml-auto">
            <Button variant="outline">
              <DocumentTextIcon className="w-4 h-4 mr-2" />
              View All Logs
            </Button>
          </Link>
        </div>
      </Card>

      {/* Integrations List */}
      {isLoading ? (
        <Card className="p-12 flex items-center justify-center">
          <Spinner size="lg" />
        </Card>
      ) : integrations.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <ServerIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              No integrations configured
            </h3>
            <p className="text-neutral-500 mb-4">
              Connect your CRM or POS system to automatically sync inventory.
            </p>
            <Link href="/settings/integrations/new">
              <Button>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Integration
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onSync={() => handleSync(integration.id)}
              onToggle={(isActive) =>
                toggleMutation.mutate({ id: integration.id, isActive })
              }
              isSyncing={syncingId === integration.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function IntegrationCard({
  integration,
  onSync,
  onToggle,
  isSyncing,
}: {
  integration: CRMIntegration;
  onSync: () => void;
  onToggle: (isActive: boolean) => void;
  isSyncing: boolean;
}) {
  const AdapterIcon = adapterIcons[integration.adapter_type] || ServerIcon;
  const adapterConfig = ADAPTER_CONFIGS[integration.adapter_type];

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
              <AdapterIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <Link
                href={`/settings/integrations/${integration.id}`}
                className="text-lg font-semibold text-neutral-900 hover:text-primary-600"
              >
                {integration.name}
              </Link>
              <p className="text-sm text-neutral-500">
                {adapterConfig?.label || integration.adapter_type}
              </p>
              {integration.branch && (
                <div className="flex items-center gap-1.5 mt-1 text-sm text-neutral-500">
                  <BuildingStorefrontIcon className="w-4 h-4" />
                  {integration.brand?.name} - {integration.branch.name}
                </div>
              )}
            </div>
          </div>
          <Badge variant={statusBadgeVariant[integration.status]}>
            {integration.status.replace('_', ' ')}
          </Badge>
        </div>

        {/* Last Sync Info */}
        <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <ClockIcon className="w-4 h-4 text-neutral-400" />
              <span className="text-neutral-600">
                Last sync:{' '}
                {integration.last_sync_at
                  ? formatDate(integration.last_sync_at)
                  : 'Never'}
              </span>
            </div>
            {integration.last_sync_status && (
              <Badge
                variant={syncStatusBadgeVariant[integration.last_sync_status]}
                size="sm"
              >
                {integration.last_sync_status}
              </Badge>
            )}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Sync interval: every {integration.sync_interval_minutes} minutes
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSync}
              isLoading={isSyncing}
              disabled={integration.status === 'pending_setup'}
            >
              <ArrowPathIcon className="w-4 h-4 mr-1" />
              Sync Now
            </Button>
            <Link href={`/settings/integrations/${integration.id}`}>
              <Button variant="ghost" size="sm">
                <Cog6ToothIcon className="w-4 h-4 mr-1" />
                Configure
              </Button>
            </Link>
          </div>
          <button
            onClick={() => onToggle(!integration.is_active)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              integration.is_active ? 'bg-success-500' : 'bg-neutral-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                integration.is_active ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </Card>
  );
}
