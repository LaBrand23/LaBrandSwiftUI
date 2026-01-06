'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { integrationsService } from '@shared/services/integrations.service';
import { SyncLog, SyncStatus } from '@shared/types';
import { formatDate } from '@shared/lib/utils';
import PageHeader from '@shared/components/layouts/PageHeader';
import Button from '@shared/components/ui/Button';
import Card from '@shared/components/ui/Card';
import Badge from '@shared/components/ui/Badge';
import Spinner from '@shared/components/ui/Spinner';
import Select from '@shared/components/ui/Select';
import Pagination from '@shared/components/ui/Pagination';
import Modal from '@shared/components/ui/Modal';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const syncStatusBadgeVariant: Record<SyncStatus, 'success' | 'warning' | 'error' | 'neutral' | 'info'> = {
  pending: 'neutral',
  running: 'info',
  success: 'success',
  partial: 'warning',
  failed: 'error',
};

export default function SyncLogsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<SyncLog | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['sync-logs', { page: currentPage, status: statusFilter }],
    queryFn: () =>
      integrationsService.getSyncLogs({
        page: currentPage,
        limit: 20,
        status: statusFilter as SyncStatus || undefined,
      }),
  });

  const logs = data?.logs || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sync Logs"
        subtitle="View sync history across all integrations"
        breadcrumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Integrations', href: '/settings/integrations' },
          { label: 'Logs' },
        ]}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Total Syncs</div>
          <div className="text-2xl font-semibold text-neutral-900 mt-1">
            {data?.pagination?.total || 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Successful</div>
          <div className="text-2xl font-semibold text-success-600 mt-1">
            {logs.filter((l) => l.status === 'success').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Partial</div>
          <div className="text-2xl font-semibold text-warning-600 mt-1">
            {logs.filter((l) => l.status === 'partial').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Failed</div>
          <div className="text-2xl font-semibold text-error-600 mt-1">
            {logs.filter((l) => l.status === 'failed').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Running</div>
          <div className="text-2xl font-semibold text-info-600 mt-1">
            {logs.filter((l) => l.status === 'running').length}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <FunnelIcon className="w-5 h-5 text-neutral-400" />
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: '', label: 'All Status' },
              { value: 'success', label: 'Success' },
              { value: 'partial', label: 'Partial' },
              { value: 'failed', label: 'Failed' },
              { value: 'running', label: 'Running' },
              { value: 'pending', label: 'Pending' },
            ]}
            className="w-40"
          />
          {statusFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter('')}
            >
              <XMarkIcon className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Logs Table */}
      <Card>
        {isLoading ? (
          <div className="p-12 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <DocumentTextIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              No sync logs found
            </h3>
            <p className="text-neutral-500">
              Sync logs will appear here when integrations run.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                      Started
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                      Integration
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                      Processed
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                      Updated
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                      Failed
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                      Duration
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b hover:bg-neutral-50 cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-neutral-900">
                            {formatDate(log.started_at)}
                          </p>
                          {log.completed_at && (
                            <p className="text-xs text-neutral-500">
                              Completed: {formatDate(log.completed_at)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-neutral-900">
                          Integration #{log.integration_id.slice(0, 8)}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {log.status === 'success' ? (
                            <CheckCircleIcon className="w-4 h-4 text-success-500" />
                          ) : log.status === 'failed' ? (
                            <ExclamationCircleIcon className="w-4 h-4 text-error-500" />
                          ) : log.status === 'running' ? (
                            <ArrowPathIcon className="w-4 h-4 text-info-500 animate-spin" />
                          ) : (
                            <ClockIcon className="w-4 h-4 text-warning-500" />
                          )}
                          <Badge variant={syncStatusBadgeVariant[log.status]} size="sm">
                            {log.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-neutral-600">
                        {log.products_processed}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-success-600 font-medium">
                        {log.products_updated}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-error-600 font-medium">
                        {log.products_failed}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-neutral-500">
                        {log.duration_ms
                          ? `${(log.duration_ms / 1000).toFixed(2)}s`
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="p-4 border-t">
                <Pagination
                  currentPage={data.pagination.page}
                  totalPages={data.pagination.totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Log Detail Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Sync Log Details"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-500">Started</p>
                <p className="font-medium text-neutral-900">
                  {formatDate(selectedLog.started_at)}
                </p>
              </div>
              <Badge variant={syncStatusBadgeVariant[selectedLog.status]}>
                {selectedLog.status}
              </Badge>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-3 bg-neutral-50 rounded-lg text-center">
                <p className="text-2xl font-semibold text-neutral-900">
                  {selectedLog.products_processed}
                </p>
                <p className="text-xs text-neutral-500">Processed</p>
              </div>
              <div className="p-3 bg-success-50 rounded-lg text-center">
                <p className="text-2xl font-semibold text-success-600">
                  {selectedLog.products_updated}
                </p>
                <p className="text-xs text-success-700">Updated</p>
              </div>
              <div className="p-3 bg-info-50 rounded-lg text-center">
                <p className="text-2xl font-semibold text-info-600">
                  {selectedLog.products_created}
                </p>
                <p className="text-xs text-info-700">Created</p>
              </div>
              <div className="p-3 bg-error-50 rounded-lg text-center">
                <p className="text-2xl font-semibold text-error-600">
                  {selectedLog.products_failed}
                </p>
                <p className="text-xs text-error-700">Failed</p>
              </div>
            </div>

            {/* Duration */}
            {selectedLog.duration_ms && (
              <div>
                <p className="text-sm text-neutral-500">Duration</p>
                <p className="font-medium text-neutral-900">
                  {(selectedLog.duration_ms / 1000).toFixed(2)} seconds
                </p>
              </div>
            )}

            {/* Errors */}
            {selectedLog.errors && selectedLog.errors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-neutral-900 mb-3">
                  Errors ({selectedLog.errors.length})
                </p>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {selectedLog.errors.map((error, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-error-50 rounded-lg border border-error-200"
                    >
                      <div className="flex items-start gap-2">
                        <ExclamationCircleIcon className="w-4 h-4 text-error-500 mt-0.5" />
                        <div className="flex-1">
                          {error.sku && (
                            <p className="text-xs text-error-600 font-mono">
                              SKU: {error.sku}
                            </p>
                          )}
                          {error.product_name && (
                            <p className="text-sm font-medium text-error-700">
                              {error.product_name}
                            </p>
                          )}
                          <p className="text-sm text-error-600">{error.message}</p>
                          <p className="text-xs text-error-500 mt-1">
                            Code: {error.error_code}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
