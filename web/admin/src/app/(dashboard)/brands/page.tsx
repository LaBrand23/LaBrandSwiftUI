'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Building2,
  Globe,
  Store,
  Package,
} from 'lucide-react';
import { PageHeader } from '../../../../../shared/components/layouts/PageHeader';
import { Card, CardContent } from '../../../../../shared/components/ui/Card';
import { Button } from '../../../../../shared/components/ui/Button';
import { Input } from '../../../../../shared/components/ui/Input';
import { Select, SelectOption } from '../../../../../shared/components/ui/Select';
import { StatusBadge, Badge } from '../../../../../shared/components/ui/Badge';
import { Pagination, PaginationInfo } from '../../../../../shared/components/ui/Pagination';
import { Spinner } from '../../../../../shared/components/ui/Spinner';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from '../../../../../shared/components/ui/Dropdown';
import { ConfirmModal } from '../../../../../shared/components/ui/Modal';
import { brandsService } from '../../../../../shared/services/brands.service';
import { formatNumber } from '../../../../../shared/lib/utils';
import { toast } from '../../../../../shared/stores/uiStore';
import { useAuthStore } from '../../../../../shared/stores/authStore';
import { Brand } from '../../../../../shared/types';

const statusOptions: SelectOption[] = [
  { value: '', label: 'All Status' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

export default function BrandsPage() {
  const { isRootAdmin } = useAuthStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; brand: Brand | null }>({
    open: false,
    brand: null,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['brands', page, search, statusFilter],
    queryFn: () =>
      brandsService.getBrands({
        page,
        limit: 20,
        search: search || undefined,
        is_active: statusFilter ? statusFilter === 'true' : undefined,
      }),
  });

  const handleToggleStatus = async (brand: Brand) => {
    try {
      await brandsService.toggleBrandStatus(brand.id, !brand.is_active);
      toast.success(brand.is_active ? 'Brand deactivated' : 'Brand activated');
      refetch();
    } catch {
      toast.error('Failed to update brand status');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.brand) return;

    try {
      await brandsService.deleteBrand(deleteModal.brand.id);
      toast.success('Brand deleted');
      setDeleteModal({ open: false, brand: null });
      refetch();
    } catch {
      toast.error('Failed to delete brand');
    }
  };

  return (
    <>
      <PageHeader
        title="Brands"
        description="Manage brands and their branches"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Brands' },
        ]}
        actions={
          <Link href="/brands/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>Add Brand</Button>
          </Link>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search brands..."
                leftIcon={<Search className="h-4 w-4" />}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* Brands Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {data.data.map((brand) => (
              <Card key={brand.id} className="hover:shadow-card-hover transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-background-secondary rounded-lg flex items-center justify-center overflow-hidden">
                        {brand.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={brand.logo_url}
                            alt={brand.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building2 className="h-6 w-6 text-text-muted" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-text-primary">
                          {brand.name}
                        </h3>
                        <p className="text-xs text-text-muted">/{brand.slug}</p>
                      </div>
                    </div>
                    <Dropdown>
                      <DropdownTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownContent align="end">
                        <DropdownItem
                          onClick={() => {
                            window.location.href = `/brands/${brand.id}`;
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </DropdownItem>
                        <DropdownItem
                          onClick={() => {
                            window.location.href = `/brands/${brand.id}/edit`;
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          onClick={() => {
                            window.location.href = `/brands/${brand.id}/branches`;
                          }}
                        >
                          <Store className="h-4 w-4" />
                          Manage Branches
                        </DropdownItem>
                        <DropdownSeparator />
                        <DropdownItem onClick={() => handleToggleStatus(brand)}>
                          {brand.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownItem>
                        {isRootAdmin() && (
                          <DropdownItem
                            onClick={() => setDeleteModal({ open: true, brand })}
                            danger
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownItem>
                        )}
                      </DropdownContent>
                    </Dropdown>
                  </div>

                  {brand.description && (
                    <p className="text-sm text-text-tertiary mb-4 line-clamp-2">
                      {brand.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                      <Store className="h-4 w-4" />
                      <span>{brand.branches_count || 0} branches</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                      <Package className="h-4 w-4" />
                      <span>{formatNumber(brand.products_count || 0)} products</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={brand.is_active ? 'active' : 'inactive'} />
                      {brand.is_featured && (
                        <Badge variant="warning" size="sm">Featured</Badge>
                      )}
                    </div>
                    {brand.website && (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-muted hover:text-text-secondary"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data.pagination && (
            <div className="flex items-center justify-between">
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
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary mb-4">No brands found</p>
            <Link href="/brands/new">
              <Button>Add your first brand</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, brand: null })}
        onConfirm={handleDelete}
        title="Delete Brand"
        message={`Are you sure you want to delete ${deleteModal.brand?.name}? This will also delete all associated products and branches.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}
