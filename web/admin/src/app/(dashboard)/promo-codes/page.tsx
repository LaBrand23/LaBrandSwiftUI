'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Tag,
  Copy,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { PageHeader } from '../../../../../shared/components/layouts/PageHeader';
import { Card, CardContent } from '../../../../../shared/components/ui/Card';
import { Button } from '../../../../../shared/components/ui/Button';
import { Input } from '../../../../../shared/components/ui/Input';
import { Select, SelectOption } from '../../../../../shared/components/ui/Select';
import { Badge } from '../../../../../shared/components/ui/Badge';
import { Pagination, PaginationInfo } from '../../../../../shared/components/ui/Pagination';
import { Spinner } from '../../../../../shared/components/ui/Spinner';
import { Modal } from '../../../../../shared/components/ui/Modal';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from '../../../../../shared/components/ui/Dropdown';
import { promoCodesService } from '../../../../../shared/services/promo-codes.service';
import { formatCurrency, formatDate } from '../../../../../shared/lib/utils';
import { toast } from '../../../../../shared/stores/uiStore';
import { PromoCode } from '../../../../../shared/types';

const statusOptions: SelectOption[] = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const typeOptions: SelectOption[] = [
  { value: '', label: 'All Types' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'fixed', label: 'Fixed Amount' },
];

export default function PromoCodesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; promoCode: PromoCode | null }>({
    open: false,
    promoCode: null,
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['promo-codes', page, search, statusFilter, typeFilter],
    queryFn: () =>
      promoCodesService.getAll({
        page,
        limit: 20,
        search: search || undefined,
        is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
        type: typeFilter as 'percentage' | 'fixed' || undefined,
      }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      promoCodesService.toggleActive(id, is_active),
    onSuccess: () => {
      toast.success('Promo code status updated');
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => promoCodesService.delete(id),
    onSuccess: () => {
      toast.success('Promo code deleted');
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      setDeleteModal({ open: false, promoCode: null });
    },
    onError: () => {
      toast.error('Failed to delete promo code');
    },
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Code "${code}" copied to clipboard`);
  };

  const isExpired = (validTo: string) => new Date(validTo) < new Date();
  const isNotStarted = (validFrom: string) => new Date(validFrom) > new Date();

  const getStatusBadge = (promoCode: PromoCode) => {
    if (!promoCode.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (isExpired(promoCode.valid_to)) {
      return <Badge variant="error">Expired</Badge>;
    }
    if (isNotStarted(promoCode.valid_from)) {
      return <Badge variant="warning">Scheduled</Badge>;
    }
    return <Badge variant="success">Active</Badge>;
  };

  return (
    <>
      <PageHeader
        title="Promo Codes"
        description="Manage discount codes and promotions"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Promo Codes' },
        ]}
        actions={
          <Link href="/promo-codes/new">
            <Button>
              <Plus className="h-4 w-4" />
              Create Promo Code
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by code..."
                leftIcon={<Search className="h-4 w-4" />}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-36"
              />
              <Select
                options={typeOptions}
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promo Codes Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : data?.promoCodes && data.promoCodes.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-border-primary bg-background-secondary">
                      <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Code
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Type
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Value
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Usage
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Valid Period
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.promoCodes.map((promoCode) => (
                      <tr
                        key={promoCode.id}
                        className="border-b border-border-subtle hover:bg-background-secondary"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono font-medium text-text-primary bg-background-secondary px-2 py-1 rounded">
                              {promoCode.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => copyCode(promoCode.code)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={promoCode.type === 'percentage' ? 'primary' : 'secondary'}>
                            {promoCode.type === 'percentage' ? 'Percentage' : 'Fixed'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-text-primary">
                            {promoCode.type === 'percentage'
                              ? `${promoCode.value}%`
                              : formatCurrency(promoCode.value)}
                          </span>
                          {promoCode.max_discount && promoCode.type === 'percentage' && (
                            <p className="text-xs text-text-muted">
                              Max: {formatCurrency(promoCode.max_discount)}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-text-secondary">
                            {promoCode.used_count}
                            {promoCode.usage_limit && ` / ${promoCode.usage_limit}`}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm text-text-secondary">
                              {formatDate(promoCode.valid_from)}
                            </p>
                            <p className="text-xs text-text-muted">
                              to {formatDate(promoCode.valid_to)}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(promoCode)}
                        </td>
                        <td className="px-4 py-3">
                          <Dropdown>
                            <DropdownTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownContent align="end">
                              <DropdownItem
                                onClick={() => {
                                  window.location.href = `/promo-codes/${promoCode.id}/edit`;
                                }}
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </DropdownItem>
                              <DropdownItem
                                onClick={() =>
                                  toggleMutation.mutate({
                                    id: promoCode.id,
                                    is_active: !promoCode.is_active,
                                  })
                                }
                              >
                                {promoCode.is_active ? (
                                  <>
                                    <ToggleLeft className="h-4 w-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <ToggleRight className="h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </DropdownItem>
                              <DropdownSeparator />
                              <DropdownItem
                                danger
                                onClick={() => setDeleteModal({ open: true, promoCode })}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownItem>
                            </DropdownContent>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.pagination && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border-primary">
                  <PaginationInfo
                    currentPage={data.pagination.page}
                    pageSize={data.pagination.limit}
                    totalItems={data.pagination.total}
                  />
                  <Pagination
                    currentPage={data.pagination.page}
                    totalPages={data.pagination.totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-secondary mb-4">No promo codes found</p>
              <Link href="/promo-codes/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  Create Your First Promo Code
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, promoCode: null })}
        title="Delete Promo Code"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            Are you sure you want to delete the promo code{' '}
            <strong>{deleteModal.promoCode?.code}</strong>? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ open: false, promoCode: null })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() =>
                deleteModal.promoCode && deleteMutation.mutate(deleteModal.promoCode.id)
              }
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
