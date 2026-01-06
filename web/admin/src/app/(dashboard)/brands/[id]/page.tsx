'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Building2,
  MapPin,
  Globe,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Plus,
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { PageHeader } from '../../../../../../shared/components/layouts/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../shared/components/ui/Card';
import { Button } from '../../../../../../shared/components/ui/Button';
import { Badge } from '../../../../../../shared/components/ui/Badge';
import { Avatar } from '../../../../../../shared/components/ui/Avatar';
import { Spinner } from '../../../../../../shared/components/ui/Spinner';
import { Modal } from '../../../../../../shared/components/ui/Modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../../../shared/components/ui/Tabs';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from '../../../../../../shared/components/ui/Dropdown';
import { brandsService } from '../../../../../../shared/services/brands.service';
import { formatCurrency, formatDate } from '../../../../../../shared/lib/utils';
import { toast } from '../../../../../../shared/stores/uiStore';

export default function BrandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const brandId = params.id as string;

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteBranchId, setDeleteBranchId] = useState<string | null>(null);

  const { data: brand, isLoading } = useQuery({
    queryKey: ['brand', brandId],
    queryFn: () => brandsService.getBrand(brandId),
    enabled: !!brandId,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (is_active: boolean) => brandsService.toggleBrandStatus(brandId, is_active),
    onSuccess: () => {
      toast.success('Brand status updated');
      queryClient.invalidateQueries({ queryKey: ['brand', brandId] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => brandsService.deleteBrand(brandId),
    onSuccess: () => {
      toast.success('Brand deleted');
      router.push('/brands');
    },
    onError: () => toast.error('Failed to delete brand'),
  });

  const deleteBranchMutation = useMutation({
    mutationFn: (branchId: string) => brandsService.deleteBranch(brandId, branchId),
    onSuccess: () => {
      toast.success('Branch deleted');
      queryClient.invalidateQueries({ queryKey: ['brand', brandId] });
      setDeleteBranchId(null);
    },
    onError: () => toast.error('Failed to delete branch'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-text-muted mx-auto mb-4" />
        <p className="text-text-secondary mb-4">Brand not found</p>
        <Button variant="secondary" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={brand.name}
        description={brand.description || 'No description'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Brands', href: '/brands' },
          { label: brand.name },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Link href={`/brands/${brandId}/edit`}>
              <Button>
                <Edit className="h-4 w-4" />
                Edit Brand
              </Button>
            </Link>
            <Dropdown>
              <DropdownTrigger asChild>
                <Button variant="secondary" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownContent align="end">
                <DropdownItem
                  onClick={() => toggleStatusMutation.mutate(!brand.is_active)}
                >
                  {brand.is_active ? (
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
                <DropdownItem danger onClick={() => setDeleteModal(true)}>
                  <Trash2 className="h-4 w-4" />
                  Delete Brand
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brand Info */}
          <Card>
            <CardHeader>
              <CardTitle>Brand Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <Avatar
                  src={brand.logo_url}
                  alt={brand.name}
                  fallback={brand.name[0]}
                  size="xl"
                />
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{brand.name}</h3>
                    <p className="text-text-muted">Slug: {brand.slug}</p>
                  </div>
                  {brand.description && (
                    <p className="text-text-secondary">{brand.description}</p>
                  )}
                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-button-primary-bg hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      {brand.website}
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branches */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Branches ({brand.branches?.length || 0})</CardTitle>
              <Link href={`/brands/${brandId}/edit?tab=branches`}>
                <Button variant="secondary" size="sm">
                  <Plus className="h-4 w-4" />
                  Add Branch
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {brand.branches && brand.branches.length > 0 ? (
                <div className="divide-y divide-border-subtle">
                  {brand.branches.map((branch) => (
                    <div
                      key={branch.id}
                      className="flex items-center justify-between p-4 hover:bg-background-secondary"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-background-secondary flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-text-muted" />
                        </div>
                        <div>
                          <p className="font-medium">{branch.name}</p>
                          <p className="text-sm text-text-muted">
                            {branch.city}
                            {branch.district && `, ${branch.district}`}
                          </p>
                          <p className="text-xs text-text-tertiary">{branch.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={branch.is_active ? 'success' : 'secondary'}>
                          {branch.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Dropdown>
                          <DropdownTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownContent align="end">
                            <DropdownItem
                              onClick={() =>
                                router.push(`/brands/${brandId}/edit?tab=branches&branch=${branch.id}`)
                              }
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </DropdownItem>
                            <DropdownSeparator />
                            <DropdownItem danger onClick={() => setDeleteBranchId(branch.id)}>
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownItem>
                          </DropdownContent>
                        </Dropdown>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-text-muted">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No branches yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Managers */}
          <Card>
            <CardHeader>
              <CardTitle>Brand Managers ({brand.managers?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {brand.managers && brand.managers.length > 0 ? (
                <div className="divide-y divide-border-subtle">
                  {brand.managers.map((manager) => (
                    <div key={manager.id} className="flex items-center gap-4 p-4">
                      <Avatar
                        src={undefined}
                        alt={manager.full_name}
                        fallback={manager.full_name[0]}
                        size="md"
                      />
                      <div className="flex-1">
                        <Link
                          href={`/users/${manager.id}`}
                          className="font-medium hover:underline"
                        >
                          {manager.full_name}
                        </Link>
                        <p className="text-sm text-text-muted">{manager.email}</p>
                      </div>
                      {manager.branch_id && (
                        <Badge variant="secondary">
                          {brand.branches?.find((b) => b.id === manager.branch_id)?.name || 'Branch'}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-text-muted">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No managers assigned</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Status</span>
                <Badge variant={brand.is_active ? 'success' : 'secondary'}>
                  {brand.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Featured</span>
                <Badge variant={brand.is_featured ? 'warning' : 'secondary'}>
                  {brand.is_featured ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Created</span>
                <span className="text-sm">{formatDate(brand.created_at)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-muted">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">Products</span>
                </div>
                <span className="font-semibold">
                  {brand.statistics?.total_products || 0}
                  {brand.statistics?.active_products !== undefined && (
                    <span className="text-text-muted text-sm font-normal">
                      {' '}
                      ({brand.statistics.active_products} active)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-muted">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="text-sm">Orders</span>
                </div>
                <span className="font-semibold">{brand.statistics?.total_orders || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-muted">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Revenue</span>
                </div>
                <span className="font-semibold">
                  {formatCurrency(brand.statistics?.total_revenue || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-muted">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Branches</span>
                </div>
                <span className="font-semibold">{brand.branches?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/products?brand_id=${brandId}`} className="block">
                <Button variant="secondary" className="w-full justify-start">
                  <Package className="h-4 w-4" />
                  View Products
                </Button>
              </Link>
              <Link href={`/orders?brand_id=${brandId}`} className="block">
                <Button variant="secondary" className="w-full justify-start">
                  <ShoppingCart className="h-4 w-4" />
                  View Orders
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Brand Modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Brand">
        <div className="space-y-4">
          <p className="text-text-secondary">
            Are you sure you want to delete <strong>{brand.name}</strong>? This will also delete all
            branches and may affect associated products.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteMutation.mutate()}
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Branch Modal */}
      <Modal
        isOpen={!!deleteBranchId}
        onClose={() => setDeleteBranchId(null)}
        title="Delete Branch"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            Are you sure you want to delete this branch? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteBranchId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteBranchId && deleteBranchMutation.mutate(deleteBranchId)}
              loading={deleteBranchMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
