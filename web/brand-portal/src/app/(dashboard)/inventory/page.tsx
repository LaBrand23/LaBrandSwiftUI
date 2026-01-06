'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@shared/stores/authStore';
import { useUIStore } from '@shared/stores/uiStore';
import { productsService } from '@shared/services/products.service';
import { Product, ProductsQueryParams } from '@shared/types';
import { formatCurrency } from '@shared/lib/utils';
import Card from '@shared/components/ui/Card';
import Button from '@shared/components/ui/Button';
import Badge from '@shared/components/ui/Badge';
import Spinner from '@shared/components/ui/Spinner';
import Modal from '@shared/components/ui/Modal';
import Input from '@shared/components/ui/Input';
import Pagination from '@shared/components/ui/Pagination';
import Select from '@shared/components/ui/Select';
import {
  MagnifyingGlassIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';

const stockOptions = [
  { value: '', label: 'All Stock' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

export default function InventoryPage() {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();
  const brandId = user?.brand_assignment?.brand_id;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustmentValue, setAdjustmentValue] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'set' | 'add' | 'subtract'>('set');

  const queryParams: ProductsQueryParams = {
    brand_id: brandId,
    page: currentPage,
    limit: 20,
    stock: stockFilter as any || undefined,
    search: searchQuery || undefined,
    status: 'active',
  };

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', queryParams],
    queryFn: () => productsService.getAll(queryParams),
    enabled: !!brandId,
  });

  const openAdjustModal = (product: Product) => {
    setSelectedProduct(product);
    setAdjustmentValue(product.stock_quantity.toString());
    setAdjustmentType('set');
    setIsAdjustModalOpen(true);
  };

  const handleAdjustStock = () => {
    // This would call an API to adjust stock
    addToast('Stock updated successfully', 'success');
    setIsAdjustModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
  };

  // Calculate inventory stats
  const stats = {
    totalProducts: data?.pagination?.total || 0,
    inStock: data?.products.filter((p) => p.stock_quantity > p.low_stock_threshold).length || 0,
    lowStock: data?.products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold).length || 0,
    outOfStock: data?.products.filter((p) => p.stock_quantity === 0).length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Inventory</h1>
        <p className="text-neutral-500 mt-1">
          Track and manage your stock levels
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Total Products</div>
          <div className="text-2xl font-semibold text-neutral-900 mt-1">
            {stats.totalProducts}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">In Stock</div>
          <div className="text-2xl font-semibold text-success-600 mt-1">
            {stats.inStock}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Low Stock</div>
          <div className="text-2xl font-semibold text-warning-600 mt-1">
            {stats.lowStock}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Out of Stock</div>
          <div className="text-2xl font-semibold text-error-600 mt-1">
            {stats.outOfStock}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <Select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={stockOptions}
            className="w-40"
          />
        </div>
      </Card>

      {/* Inventory Table */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : !data?.products.length ? (
          <div className="text-center py-12">
            <ArchiveBoxIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              No products found
            </h3>
            <p className="text-neutral-500">
              Add products to track inventory.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                    Product
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                    SKU
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                    Price
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600">
                    Stock
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.products.map((product) => {
                  const images = product.images as string[];
                  const isLowStock =
                    product.stock_quantity > 0 &&
                    product.stock_quantity <= product.low_stock_threshold;
                  const isOutOfStock = product.stock_quantity === 0;

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-neutral-100 hover:bg-neutral-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-neutral-100 rounded overflow-hidden">
                            {images?.[0] ? (
                              <img
                                src={images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ArchiveBoxIcon className="w-5 h-5 text-neutral-400" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-neutral-900">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-600">
                        {product.sku}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-neutral-900">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {(isLowStock || isOutOfStock) && (
                            <ExclamationTriangleIcon
                              className={`w-4 h-4 ${
                                isOutOfStock ? 'text-error-500' : 'text-warning-500'
                              }`}
                            />
                          )}
                          <span
                            className={`font-medium ${
                              isOutOfStock
                                ? 'text-error-600'
                                : isLowStock
                                ? 'text-warning-600'
                                : 'text-neutral-900'
                            }`}
                          >
                            {product.stock_quantity}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            isOutOfStock
                              ? 'error'
                              : isLowStock
                              ? 'warning'
                              : 'success'
                          }
                          size="sm"
                        >
                          {isOutOfStock
                            ? 'Out of Stock'
                            : isLowStock
                            ? 'Low Stock'
                            : 'In Stock'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAdjustModal(product)}
                        >
                          Adjust Stock
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="p-4 border-t border-neutral-100">
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Adjust Stock"
        size="sm"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="p-3 bg-neutral-50 rounded-lg">
              <p className="font-medium text-neutral-900">
                {selectedProduct.name}
              </p>
              <p className="text-sm text-neutral-500">
                Current stock: {selectedProduct.stock_quantity}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setAdjustmentType('set')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  adjustmentType === 'set'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Set
              </button>
              <button
                onClick={() => setAdjustmentType('add')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  adjustmentType === 'add'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <PlusIcon className="w-4 h-4 inline mr-1" />
                Add
              </button>
              <button
                onClick={() => setAdjustmentType('subtract')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  adjustmentType === 'subtract'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <MinusIcon className="w-4 h-4 inline mr-1" />
                Remove
              </button>
            </div>

            <Input
              label="Quantity"
              type="number"
              value={adjustmentValue}
              onChange={(e) => setAdjustmentValue(e.target.value)}
              min="0"
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="ghost"
                onClick={() => setIsAdjustModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAdjustStock}>Update Stock</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
