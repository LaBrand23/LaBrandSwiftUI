'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthStore } from '@shared/stores/authStore';
import { useUIStore } from '@shared/stores/uiStore';
import { productsService } from '@shared/services/products.service';
import { ProductStatus } from '@shared/types';
import { formatCurrency, formatDate } from '@shared/lib/utils';
import Card from '@shared/components/ui/Card';
import Button from '@shared/components/ui/Button';
import Badge from '@shared/components/ui/Badge';
import Spinner from '@shared/components/ui/Spinner';
import Modal from '@shared/components/ui/Modal';
import { useState } from 'react';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  TagIcon,
  SwatchIcon,
  ArchiveBoxIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentDuplicateIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const statusBadgeVariant: Record<ProductStatus, 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  draft: 'warning',
  archived: 'neutral',
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const productId = params.id as string;
  const brandId = user?.brand_assignment?.brand_id;

  const [deleteModal, setDeleteModal] = useState(false);
  const [statusModal, setStatusModal] = useState<{ open: boolean; status: ProductStatus | null }>({
    open: false,
    status: null,
  });
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsService.getById(productId),
    enabled: !!productId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: ProductStatus) =>
      productsService.update(productId, { status }),
    onSuccess: () => {
      addToast('Product status updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      setStatusModal({ open: false, status: null });
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to update status', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => productsService.delete(productId),
    onSuccess: () => {
      addToast('Product deleted successfully', 'success');
      router.push('/products');
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to delete product', 'error');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <CubeIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 mb-2">Product not found</h3>
        <p className="text-neutral-500 mb-4">The product you're looking for doesn't exist.</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  // Verify product belongs to user's brand
  if (product.brand_id !== brandId) {
    return (
      <div className="text-center py-12">
        <CubeIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 mb-2">Access Denied</h3>
        <p className="text-neutral-500 mb-4">You don't have permission to view this product.</p>
        <Button variant="outline" onClick={() => router.push('/products')}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
      </div>
    );
  }

  const images = (product.images as string[]) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-neutral-900">{product.name}</h1>
              <Badge variant={statusBadgeVariant[product.status]}>
                {product.status}
              </Badge>
            </div>
            <p className="text-neutral-500 mt-1">SKU: {product.sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/products/${productId}/variants`}>
            <Button variant="outline">
              <SwatchIcon className="w-4 h-4 mr-2" />
              Variants ({product.variants?.length || 0})
            </Button>
          </Link>
          <Link href={`/products/${productId}/edit`}>
            <Button variant="outline">
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button>
            {product.status === 'active' ? (
              <>
                <EyeSlashIcon className="w-4 h-4 mr-2" />
                Unpublish
              </>
            ) : (
              <>
                <EyeIcon className="w-4 h-4 mr-2" />
                Publish
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Product Images</h2>
              {images.length > 0 ? (
                <div className="space-y-4">
                  <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden">
                    <img
                      src={images[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                            selectedImage === idx
                              ? 'border-primary-500'
                              : 'border-transparent hover:border-neutral-300'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${product.name} ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-neutral-100 rounded-lg flex items-center justify-center">
                  <CubeIcon className="w-16 h-16 text-neutral-300" />
                </div>
              )}
            </div>
          </Card>

          {/* Description */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Description</h2>
              {product.description ? (
                <p className="text-neutral-600 whitespace-pre-wrap">{product.description}</p>
              ) : (
                <p className="text-neutral-400 italic">No description provided</p>
              )}
            </div>
          </Card>

          {/* Variants */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-900">Variants</h2>
                <Link href={`/products/${productId}/variants`}>
                  <Button variant="ghost" size="sm">
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Manage
                  </Button>
                </Link>
              </div>
              {product.variants && product.variants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left py-3 px-2 text-sm font-medium text-neutral-600">Variant</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-neutral-600">SKU</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-neutral-600">Price</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-neutral-600">Stock</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-neutral-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.variants.map((variant) => (
                        <tr key={variant.id} className="border-b border-neutral-100">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              {variant.color && (
                                <div
                                  className="w-4 h-4 rounded-full border border-neutral-200"
                                  style={{ backgroundColor: variant.color_code || variant.color }}
                                  title={variant.color}
                                />
                              )}
                              <span className="font-medium">
                                {[variant.color, variant.size].filter(Boolean).join(' / ') || 'Default'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-sm text-neutral-600">{variant.sku}</td>
                          <td className="py-3 px-2 text-sm text-right font-medium">
                            {formatCurrency(variant.price)}
                          </td>
                          <td className="py-3 px-2 text-sm text-right">
                            <span className={variant.stock_quantity <= 5 ? 'text-warning-600' : ''}>
                              {variant.stock_quantity}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <Badge variant={variant.is_active ? 'success' : 'neutral'} size="sm">
                              {variant.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <SwatchIcon className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                  <p className="text-neutral-500">No variants defined</p>
                  <Link href={`/products/${productId}/variants`}>
                    <Button variant="ghost" size="sm" className="mt-2">
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Add Variant
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Pricing</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Price</span>
                  <span className="text-xl font-bold text-neutral-900">
                    {formatCurrency(product.price)}
                  </span>
                </div>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Compare at</span>
                    <span className="text-neutral-400 line-through">
                      {formatCurrency(product.compare_at_price)}
                    </span>
                  </div>
                )}
                {product.cost_per_item && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Cost</span>
                    <span className="text-neutral-500">
                      {formatCurrency(product.cost_per_item)}
                    </span>
                  </div>
                )}
                {product.cost_per_item && (
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <span className="text-neutral-600">Profit</span>
                    <span className="text-success-600 font-medium">
                      {formatCurrency(product.price - product.cost_per_item)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Stock */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Inventory</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Total Stock</span>
                  <span className={`font-semibold ${
                    product.stock_quantity <= product.low_stock_threshold
                      ? 'text-warning-600'
                      : 'text-neutral-900'
                  }`}>
                    {product.stock_quantity}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Low Stock Alert</span>
                  <span className="text-neutral-500">{product.low_stock_threshold}</span>
                </div>
                {product.stock_quantity <= product.low_stock_threshold && (
                  <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
                    <p className="text-sm text-warning-800">
                      Stock is running low. Consider restocking soon.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Details */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Details</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Category</span>
                  <span className="text-neutral-900">{product.category?.name || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Gender</span>
                  <Badge variant="info" size="sm">
                    {product.gender || 'All'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Created</span>
                  <span className="text-neutral-500 text-sm">{formatDate(product.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Updated</span>
                  <span className="text-neutral-500 text-sm">{formatDate(product.updated_at)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="neutral" size="sm">
                      <TagIcon className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <div className="p-6 space-y-3">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Actions</h2>

              {product.status === 'draft' && (
                <Button
                  className="w-full"
                  onClick={() => setStatusModal({ open: true, status: 'active' })}
                >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Publish Product
                </Button>
              )}

              {product.status === 'active' && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setStatusModal({ open: true, status: 'draft' })}
                >
                  <EyeSlashIcon className="w-4 h-4 mr-2" />
                  Unpublish
                </Button>
              )}

              {product.status !== 'archived' && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setStatusModal({ open: true, status: 'archived' })}
                >
                  <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                  Archive
                </Button>
              )}

              {product.status === 'archived' && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setStatusModal({ open: true, status: 'draft' })}
                >
                  <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                  Restore to Draft
                </Button>
              )}

              <Button
                variant="danger"
                className="w-full"
                onClick={() => setDeleteModal(true)}
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete Product
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Product"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            Are you sure you want to delete <strong>{product.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="ghost" onClick={() => setDeleteModal(false)}>
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

      {/* Status Change Modal */}
      <Modal
        isOpen={statusModal.open}
        onClose={() => setStatusModal({ open: false, status: null })}
        title={`${statusModal.status === 'active' ? 'Publish' : statusModal.status === 'archived' ? 'Archive' : 'Unpublish'} Product`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            {statusModal.status === 'active' && 'This will make the product visible to customers.'}
            {statusModal.status === 'draft' && 'This will hide the product from customers.'}
            {statusModal.status === 'archived' && 'This will archive the product and hide it from your catalog.'}
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="ghost" onClick={() => setStatusModal({ open: false, status: null })}>
              Cancel
            </Button>
            <Button
              onClick={() => statusModal.status && updateStatusMutation.mutate(statusModal.status)}
              isLoading={updateStatusMutation.isPending}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
