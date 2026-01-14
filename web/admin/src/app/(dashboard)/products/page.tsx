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
  Package,
  Archive,
  CheckCircle,
} from 'lucide-react';
import { PageHeader } from '../../../../../shared/components/layouts/PageHeader';
import { Card, CardContent } from '../../../../../shared/components/ui/Card';
import { Button } from '../../../../../shared/components/ui/Button';
import { Input } from '../../../../../shared/components/ui/Input';
import { Select, SelectOption } from '../../../../../shared/components/ui/Select';
import { StatusBadge } from '../../../../../shared/components/ui/Badge';
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
import { productsService } from '../../../../../shared/services/products.service';
import { formatCurrency, formatNumber, getStockStatus } from '../../../../../shared/lib/utils';
import { toast } from '../../../../../shared/stores/uiStore';
import { useAuthStore } from '../../../../../shared/stores/authStore';
import { Product, ProductStatus } from '../../../../../shared/types';

const statusOptions: SelectOption[] = [
  { value: '', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

const stockOptions: SelectOption[] = [
  { value: '', label: 'All Stock' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

export default function ProductsPage() {
  const { isRootAdmin } = useAuthStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['products', page, search, statusFilter, stockFilter],
    queryFn: () =>
      productsService.getProducts({
        page,
        limit: 20,
        search: search || undefined,
        status: statusFilter as ProductStatus || undefined,
        stock: stockFilter as 'in_stock' | 'low_stock' | 'out_of_stock' || undefined,
      }),
  });

  const handleSelectAll = () => {
    if (selectedProducts.length === data?.data.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(data?.data.map((p) => p.id) || []);
    }
  };

  const handleSelect = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter((pid) => pid !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const handleBulkStatusUpdate = async (status: ProductStatus) => {
    try {
      await productsService.bulkUpdateStatus(selectedProducts, status);
      toast.success(`${selectedProducts.length} products updated`);
      setSelectedProducts([]);
      refetch();
    } catch {
      toast.error('Failed to update products');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.product) return;

    try {
      await productsService.deleteProduct(deleteModal.product.id);
      toast.success('Product deleted');
      setDeleteModal({ open: false, product: null });
      refetch();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage product catalog"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Products' },
        ]}
        actions={
          <Link href="/products/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>Add Product</Button>
          </Link>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name or SKU..."
                leftIcon={<Search className="h-4 w-4" />}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="flex gap-3">
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-32"
              />
              <Select
                options={stockOptions}
                value={stockFilter}
                onChange={(e) => {
                  setStockFilter(e.target.value);
                  setPage(1);
                }}
                className="w-36"
              />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border-primary">
              <span className="text-sm text-text-secondary">
                {selectedProducts.length} selected
              </span>
              <Button
                variant="neutral"
                size="sm"
                onClick={() => handleBulkStatusUpdate('active')}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Activate
              </Button>
              <Button
                variant="neutral"
                size="sm"
                onClick={() => handleBulkStatusUpdate('archived')}
              >
                <Archive className="h-4 w-4 mr-1" />
                Archive
              </Button>
              {isRootAdmin() && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    // Handle bulk delete
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-border-primary bg-background-secondary">
                      <th className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === data.data.length}
                          onChange={handleSelectAll}
                          className="rounded border-border-primary"
                        />
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Product
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        SKU
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Price
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
                    {data.data.map((product) => {
                      const stockStatus = getStockStatus(
                        product.stock_quantity,
                        product.low_stock_threshold
                      );
                      const images = Array.isArray(product.images)
                        ? product.images
                        : [];
                      const firstImage = typeof images[0] === 'string'
                        ? images[0]
                        : (images[0] as { url?: string })?.url;

                      return (
                        <tr
                          key={product.id}
                          className="border-b border-border-subtle hover:bg-background-secondary"
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product.id)}
                              onChange={() => handleSelect(product.id)}
                              className="rounded border-border-primary"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-background-secondary rounded-lg flex items-center justify-center overflow-hidden">
                                {firstImage ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={firstImage}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="h-5 w-5 text-text-muted" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-text-primary">
                                  {product.name}
                                </p>
                                <p className="text-xs text-text-muted">
                                  {product.brand?.name} • {product.category?.name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-mono text-text-secondary">
                              {product.sku}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-text-primary">
                                {formatCurrency(product.price)}
                              </p>
                              {product.compare_at_price && product.compare_at_price > product.price && (
                                <p className="text-xs text-text-muted line-through">
                                  {formatCurrency(product.compare_at_price)}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-text-secondary">
                                {formatNumber(product.stock_quantity)}
                              </span>
                              <StatusBadge status={stockStatus} />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={product.status} />
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
                                    window.location.href = `/products/${product.id}`;
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </DropdownItem>
                                <DropdownItem
                                  onClick={() => {
                                    window.location.href = `/products/${product.id}/edit`;
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </DropdownItem>
                                <DropdownSeparator />
                                <DropdownItem
                                  onClick={() => setDeleteModal({ open: true, product })}
                                  danger
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </DropdownItem>
                              </DropdownContent>
                            </Dropdown>
                          </td>
                        </tr>
                      );
                    })}
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
              <Package className="h-12 w-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-secondary mb-4">No products found</p>
              <Link href="/products/new">
                <Button>Add your first product</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, product: null })}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete ${deleteModal.product?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}
