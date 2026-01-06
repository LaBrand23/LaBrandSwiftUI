'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@shared/stores/authStore';
import { useUIStore } from '@shared/stores/uiStore';
import { productsService } from '@shared/services/products.service';
import { Product, ProductsQueryParams, ProductStatus } from '@shared/types';
import { formatCurrency } from '@shared/lib/utils';
import Card from '@shared/components/ui/Card';
import Button from '@shared/components/ui/Button';
import Badge from '@shared/components/ui/Badge';
import Spinner from '@shared/components/ui/Spinner';
import Pagination from '@shared/components/ui/Pagination';
import Select from '@shared/components/ui/Select';
import Link from 'next/link';
import {
  PlusIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  CubeIcon,
  EyeIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

const statusBadgeVariant: Record<ProductStatus, 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  draft: 'warning',
  archived: 'neutral',
};

export default function ProductsPage() {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();
  const brandId = user?.brand_assignment?.brand_id;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const queryParams: ProductsQueryParams = {
    brand_id: brandId,
    page: currentPage,
    limit: 12,
    status: statusFilter as ProductStatus || undefined,
    search: searchQuery || undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => productsService.getAll(queryParams),
    enabled: !!brandId,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Products</h1>
          <p className="text-neutral-500 mt-1">
            Manage your product catalog
          </p>
        </div>
        <Link href="/products/new">
          <Button>
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={statusOptions}
            className="w-36"
          />
        </div>
      </Card>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : !data?.products.length ? (
        <Card className="p-12">
          <div className="text-center">
            <CubeIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              No products found
            </h3>
            <p className="text-neutral-500 mb-4">
              Start by adding your first product.
            </p>
            <Link href="/products/new">
              <Button>
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Product
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const images = product.images as string[];
  const imageUrl = images?.[0] || '';

  return (
    <Card className="overflow-hidden group">
      {/* Image */}
      <div className="aspect-square bg-neutral-100 relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CubeIcon className="w-12 h-12 text-neutral-300" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={statusBadgeVariant[product.status]} size="sm">
            {product.status}
          </Badge>
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Link href={`/products/${product.id}`}>
            <Button variant="outline" size="sm" className="bg-white">
              <EyeIcon className="w-4 h-4 mr-1" />
              View
            </Button>
          </Link>
          <Link href={`/products/${product.id}/edit`}>
            <Button variant="outline" size="sm" className="bg-white">
              <PencilIcon className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <Link href={`/products/${product.id}`}>
        <div className="p-4 cursor-pointer hover:bg-neutral-50 transition-colors">
          <h3 className="font-medium text-neutral-900 truncate">{product.name}</h3>
          <p className="text-sm text-neutral-500 mt-1">SKU: {product.sku}</p>

          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="font-semibold text-neutral-900">
                {formatCurrency(product.price)}
              </p>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <p className="text-sm text-neutral-400 line-through">
                  {formatCurrency(product.compare_at_price)}
                </p>
              )}
            </div>

            <div className="text-right">
              <p className="text-sm text-neutral-600">
                Stock: {product.stock_quantity}
              </p>
              {product.stock_quantity <= product.low_stock_threshold && (
                <Badge variant="warning" size="sm">
                  Low Stock
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}
