'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@shared/stores/authStore';
import { useUIStore } from '@shared/stores/uiStore';
import { productsService, CreateVariantPayload } from '@shared/services/products.service';
import { ProductVariant } from '@shared/types';
import { formatCurrency } from '@shared/lib/utils';
import Card from '@shared/components/ui/Card';
import Button from '@shared/components/ui/Button';
import Input from '@shared/components/ui/Input';
import Badge from '@shared/components/ui/Badge';
import Spinner from '@shared/components/ui/Spinner';
import Modal from '@shared/components/ui/Modal';
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  SwatchIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

interface VariantFormData {
  sku: string;
  color: string;
  color_code: string;
  size: string;
  price: string;
  stock_quantity: string;
  is_active: boolean;
}

const initialVariantForm: VariantFormData = {
  sku: '',
  color: '',
  color_code: '#000000',
  size: '',
  price: '',
  stock_quantity: '0',
  is_active: true,
};

const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const commonColors = [
  { name: 'Black', code: '#000000' },
  { name: 'White', code: '#FFFFFF' },
  { name: 'Navy', code: '#000080' },
  { name: 'Gray', code: '#808080' },
  { name: 'Red', code: '#FF0000' },
  { name: 'Blue', code: '#0000FF' },
  { name: 'Green', code: '#008000' },
  { name: 'Beige', code: '#F5F5DC' },
];

export default function ProductVariantsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const productId = params.id as string;
  const brandId = user?.brand_assignment?.brand_id;

  const [variantModal, setVariantModal] = useState<{ open: boolean; variant: ProductVariant | null }>({
    open: false,
    variant: null,
  });
  const [deleteModal, setDeleteModal] = useState<ProductVariant | null>(null);
  const [formData, setFormData] = useState<VariantFormData>(initialVariantForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch product
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsService.getById(productId),
    enabled: !!productId,
  });

  // Create variant mutation
  const createVariantMutation = useMutation({
    mutationFn: (payload: CreateVariantPayload) => productsService.createVariant(productId, payload),
    onSuccess: () => {
      addToast('Variant created successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      closeVariantModal();
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to create variant', 'error');
    },
  });

  // Update variant mutation
  const updateVariantMutation = useMutation({
    mutationFn: ({ variantId, payload }: { variantId: string; payload: Partial<CreateVariantPayload> }) =>
      productsService.updateVariant(productId, variantId, payload),
    onSuccess: () => {
      addToast('Variant updated successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      closeVariantModal();
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to update variant', 'error');
    },
  });

  // Delete variant mutation
  const deleteVariantMutation = useMutation({
    mutationFn: (variantId: string) => productsService.deleteVariant(productId, variantId),
    onSuccess: () => {
      addToast('Variant deleted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      setDeleteModal(null);
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to delete variant', 'error');
    },
  });

  const openVariantModal = (variant: ProductVariant | null = null) => {
    if (variant) {
      setFormData({
        sku: variant.sku,
        color: variant.color || '',
        color_code: variant.color_code || '#000000',
        size: variant.size || '',
        price: variant.price.toString(),
        stock_quantity: variant.stock_quantity.toString(),
        is_active: variant.is_active,
      });
    } else {
      setFormData({
        ...initialVariantForm,
        price: product?.price.toString() || '',
      });
    }
    setVariantModal({ open: true, variant });
    setErrors({});
  };

  const closeVariantModal = () => {
    setVariantModal({ open: false, variant: null });
    setFormData(initialVariantForm);
    setErrors({});
  };

  const generateVariantSku = () => {
    const baseSku = product?.sku || 'PRD';
    const color = formData.color?.substring(0, 3).toUpperCase() || '';
    const size = formData.size || '';
    const random = Math.random().toString(36).substring(2, 4).toUpperCase();
    setFormData({ ...formData, sku: `${baseSku}-${color}${size}-${random}` });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.color && !formData.size) newErrors.color = 'At least color or size is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const payload: CreateVariantPayload = {
        sku: formData.sku.trim(),
        color: formData.color.trim() || undefined,
        color_code: formData.color ? formData.color_code : undefined,
        size: formData.size.trim() || undefined,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        is_active: formData.is_active,
      };

      if (variantModal.variant) {
        updateVariantMutation.mutate({ variantId: variantModal.variant.id, payload });
      } else {
        createVariantMutation.mutate(payload);
      }
    }
  };

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
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  if (product.brand_id !== brandId) {
    return (
      <div className="text-center py-12">
        <CubeIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 mb-2">Access Denied</h3>
        <Button variant="outline" onClick={() => router.push('/products')}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
      </div>
    );
  }

  const variants = product.variants || [];
  const totalStock = variants.reduce((sum, v) => sum + v.stock_quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push(`/products/${productId}`)}>
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Product Variants</h1>
            <p className="text-neutral-500 mt-1">{product.name}</p>
          </div>
        </div>
        <Button onClick={() => openVariantModal()}>
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Variant
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <SwatchIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{variants.length}</p>
              <p className="text-sm text-neutral-500">Total Variants</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
              <CubeIcon className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{totalStock}</p>
              <p className="text-sm text-neutral-500">Total Stock</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center">
              <SwatchIcon className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">
                {variants.filter((v) => v.is_active).length}
              </p>
              <p className="text-sm text-neutral-500">Active Variants</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Variants Table */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">All Variants</h2>

          {variants.length === 0 ? (
            <div className="text-center py-12">
              <SwatchIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No variants yet</h3>
              <p className="text-neutral-500 mb-4">
                Add variants to offer different sizes, colors, or options.
              </p>
              <Button onClick={() => openVariantModal()}>
                <PlusIcon className="w-5 h-5 mr-2" />
                Add First Variant
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Variant</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">SKU</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">Price</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">Stock</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant) => (
                    <tr key={variant.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {variant.color && (
                            <div
                              className="w-8 h-8 rounded-full border border-neutral-200 shadow-sm"
                              style={{ backgroundColor: variant.color_code || variant.color }}
                              title={variant.color}
                            />
                          )}
                          <div>
                            <p className="font-medium text-neutral-900">
                              {[variant.color, variant.size].filter(Boolean).join(' / ') || 'Default'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-neutral-600 font-mono">{variant.sku}</td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-semibold text-neutral-900">
                          {formatCurrency(variant.price)}
                        </span>
                        {variant.price !== product.price && (
                          <span className="text-xs text-neutral-400 ml-1">
                            {variant.price > product.price ? '+' : ''}
                            {formatCurrency(variant.price - product.price)}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span
                          className={`font-medium ${
                            variant.stock_quantity <= 5 ? 'text-warning-600' : 'text-neutral-900'
                          }`}
                        >
                          {variant.stock_quantity}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge variant={variant.is_active ? 'success' : 'neutral'} size="sm">
                          {variant.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openVariantModal(variant)}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteModal(variant)}
                            className="text-error-600 hover:bg-error-50"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Variant Modal */}
      <Modal
        isOpen={variantModal.open}
        onClose={closeVariantModal}
        title={variantModal.variant ? 'Edit Variant' : 'Add Variant'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Color</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {commonColors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.name, color_code: color.code })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color.name
                      ? 'border-primary-500 scale-110'
                      : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                  style={{ backgroundColor: color.code }}
                  title={color.name}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="Color name"
                className="flex-1"
                error={errors.color}
              />
              <input
                type="color"
                value={formData.color_code}
                onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                className="w-12 h-10 rounded-lg border border-neutral-200 cursor-pointer"
              />
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Size</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {commonSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFormData({ ...formData, size })}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    formData.size === size
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <Input
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              placeholder="Or enter custom size"
            />
          </div>

          {/* SKU */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                label="SKU"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                placeholder="Variant SKU"
                error={errors.sku}
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="button" variant="outline" onClick={generateVariantSku}>
                Generate
              </Button>
            </div>
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (UZS)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              error={errors.price}
              required
            />
            <Input
              label="Stock Quantity"
              type="number"
              value={formData.stock_quantity}
              onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
              min="0"
            />
          </div>

          {/* Active */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-700">Active (available for purchase)</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={closeVariantModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createVariantMutation.isPending || updateVariantMutation.isPending}
            >
              {variantModal.variant ? 'Update Variant' : 'Add Variant'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Variant"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            Are you sure you want to delete the variant{' '}
            <strong>
              {[deleteModal?.color, deleteModal?.size].filter(Boolean).join(' / ') || deleteModal?.sku}
            </strong>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="ghost" onClick={() => setDeleteModal(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteModal && deleteVariantMutation.mutate(deleteModal.id)}
              isLoading={deleteVariantMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
