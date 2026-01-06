'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Star,
  ShoppingCart,
  DollarSign,
  MoreHorizontal,
  Eye,
  EyeOff,
  Archive,
  Plus,
} from 'lucide-react';
import { PageHeader } from '../../../../../../shared/components/layouts/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../shared/components/ui/Card';
import { Button } from '../../../../../../shared/components/ui/Button';
import { Badge, StatusBadge } from '../../../../../../shared/components/ui/Badge';
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
import { productsService } from '../../../../../../shared/services/products.service';
import { formatCurrency, formatDate } from '../../../../../../shared/lib/utils';
import { toast } from '../../../../../../shared/stores/uiStore';
import { useState } from 'react';
import { ProductStatus, ProductVariant } from '../../../../../../shared/types';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const productId = params.id as string;

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteVariantId, setDeleteVariantId] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsService.getProduct(productId),
    enabled: !!productId,
  });

  const statusMutation = useMutation({
    mutationFn: ({ status }: { status: ProductStatus }) =>
      productsService.updateProduct(productId, { status }),
    onSuccess: () => {
      toast.success('Product status updated');
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => productsService.deleteProduct(productId),
    onSuccess: () => {
      toast.success('Product deleted');
      router.push('/products');
    },
    onError: () => toast.error('Failed to delete product'),
  });

  const deleteVariantMutation = useMutation({
    mutationFn: (variantId: string) => productsService.deleteVariant(productId, variantId),
    onSuccess: () => {
      toast.success('Variant deleted');
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      setDeleteVariantId(null);
    },
    onError: () => toast.error('Failed to delete variant'),
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
        <Package className="h-12 w-12 text-text-muted mx-auto mb-4" />
        <p className="text-text-secondary mb-4">Product not found</p>
        <Button variant="secondary" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const totalStock =
    product.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) || product.stock_quantity;
  const images = Array.isArray(product.images)
    ? product.images.map((img) => (typeof img === 'string' ? img : img.url))
    : [];

  return (
    <>
      <PageHeader
        title={product.name}
        description={`SKU: ${product.sku}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Products', href: '/products' },
          { label: product.name },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Link href={`/products/${productId}/edit`}>
              <Button>
                <Edit className="h-4 w-4" />
                Edit Product
              </Button>
            </Link>
            <Dropdown>
              <DropdownTrigger asChild>
                <Button variant="secondary" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownContent align="end">
                {product.status === 'active' ? (
                  <DropdownItem onClick={() => statusMutation.mutate({ status: 'draft' })}>
                    <EyeOff className="h-4 w-4" />
                    Mark as Draft
                  </DropdownItem>
                ) : product.status === 'draft' ? (
                  <DropdownItem onClick={() => statusMutation.mutate({ status: 'active' })}>
                    <Eye className="h-4 w-4" />
                    Publish
                  </DropdownItem>
                ) : null}
                <DropdownItem onClick={() => statusMutation.mutate({ status: 'archived' })}>
                  <Archive className="h-4 w-4" />
                  Archive
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem danger onClick={() => setDeleteModal(true)}>
                  <Trash2 className="h-4 w-4" />
                  Delete Product
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent>
              {images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((url, idx) => (
                    <div
                      key={idx}
                      className="aspect-square bg-background-secondary rounded-lg overflow-hidden"
                    >
                      <img
                        src={url}
                        alt={`${product.name} - ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-text-muted">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No images uploaded</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.description && (
                <div>
                  <p className="text-sm text-text-muted mb-1">Description</p>
                  <p className="text-text-primary">{product.description}</p>
                </div>
              )}
              {product.short_description && (
                <div>
                  <p className="text-sm text-text-muted mb-1">Short Description</p>
                  <p className="text-text-secondary">{product.short_description}</p>
                </div>
              )}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <p className="text-sm text-text-muted mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Variants ({product.variants?.length || 0})</CardTitle>
              <Link href={`/products/${productId}/edit?tab=variants`}>
                <Button variant="secondary" size="sm">
                  <Plus className="h-4 w-4" />
                  Add Variant
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {product.variants && product.variants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-border-primary bg-background-secondary">
                        <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                          SKU
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                          Size
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                          Color
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                          Price Modifier
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                          Stock
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
                      {product.variants.map((variant) => (
                        <tr
                          key={variant.id}
                          className="border-b border-border-subtle hover:bg-background-secondary"
                        >
                          <td className="px-4 py-3">
                            <code className="text-sm font-mono">{variant.sku}</code>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm">{variant.size || '-'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {variant.color_hex && (
                                <span
                                  className="w-4 h-4 rounded-full border border-border-primary"
                                  style={{ backgroundColor: variant.color_hex }}
                                />
                              )}
                              <span className="text-sm">{variant.color || '-'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm">
                              {variant.price_modifier > 0
                                ? `+${formatCurrency(variant.price_modifier)}`
                                : variant.price_modifier < 0
                                ? formatCurrency(variant.price_modifier)
                                : '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-sm font-medium ${
                                variant.stock_quantity === 0
                                  ? 'text-accent-error'
                                  : variant.stock_quantity < 10
                                  ? 'text-accent-warning'
                                  : 'text-text-primary'
                              }`}
                            >
                              {variant.stock_quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={variant.is_active ? 'success' : 'secondary'}>
                              {variant.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setDeleteVariantId(variant.id)}
                            >
                              <Trash2 className="h-4 w-4 text-accent-error" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-text-muted">
                  <p>No variants created yet</p>
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
                <StatusBadge status={product.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Featured</span>
                <Badge variant={product.is_featured ? 'warning' : 'secondary'}>
                  {product.is_featured ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Created</span>
                <span className="text-sm">{formatDate(product.created_at)}</span>
              </div>
              {product.updated_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">Updated</span>
                  <span className="text-sm">{formatDate(product.updated_at)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Price</span>
                <span className="text-lg font-semibold">{formatCurrency(product.price)}</span>
              </div>
              {product.compare_at_price && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">Compare at</span>
                  <span className="text-sm line-through text-text-muted">
                    {formatCurrency(product.compare_at_price)}
                  </span>
                </div>
              )}
              {product.cost_price && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">Cost</span>
                  <span className="text-sm">{formatCurrency(product.cost_price)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Total Stock</span>
                <span
                  className={`font-semibold ${
                    totalStock === 0
                      ? 'text-accent-error'
                      : totalStock < product.low_stock_threshold
                      ? 'text-accent-warning'
                      : 'text-accent-success'
                  }`}
                >
                  {totalStock}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Low Stock Alert</span>
                <span className="text-sm">{product.low_stock_threshold}</span>
              </div>
            </CardContent>
          </Card>

          {/* Organization */}
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.brand && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">Brand</span>
                  <Link
                    href={`/brands/${product.brand.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {product.brand.name}
                  </Link>
                </div>
              )}
              {product.branch && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">Branch</span>
                  <span className="text-sm">{product.branch.name}</span>
                </div>
              )}
              {product.category && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">Category</span>
                  <span className="text-sm">{product.category.name}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          {product.sales_statistics && (
            <Card>
              <CardHeader>
                <CardTitle>Sales Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">Total Sold</span>
                  <span className="font-semibold">{product.sales_statistics.total_sold}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">Revenue</span>
                  <span className="font-semibold">
                    {formatCurrency(product.sales_statistics.total_revenue)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">Last 30 Days</span>
                  <span className="text-sm">{product.sales_statistics.last_30_days_sold} sold</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          {product.reviews_summary && (
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-accent-gold fill-accent-gold" />
                  <span className="text-lg font-semibold">
                    {product.reviews_summary.average_rating.toFixed(1)}
                  </span>
                  <span className="text-text-muted">
                    ({product.reviews_summary.total_reviews} reviews)
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Product Modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Product">
        <div className="space-y-4">
          <p className="text-text-secondary">
            Are you sure you want to delete <strong>{product.name}</strong>? This action cannot be
            undone.
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

      {/* Delete Variant Modal */}
      <Modal
        isOpen={!!deleteVariantId}
        onClose={() => setDeleteVariantId(null)}
        title="Delete Variant"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            Are you sure you want to delete this variant? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteVariantId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteVariantId && deleteVariantMutation.mutate(deleteVariantId)}
              loading={deleteVariantMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
