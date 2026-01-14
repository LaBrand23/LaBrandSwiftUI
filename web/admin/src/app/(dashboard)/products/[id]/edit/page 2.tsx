'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Package, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../../../../../../../shared/components/layouts/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../../shared/components/ui/Card';
import { Button } from '../../../../../../../shared/components/ui/Button';
import { Input } from '../../../../../../../shared/components/ui/Input';
import { Select, SelectOption } from '../../../../../../../shared/components/ui/Select';
import { FormField } from '../../../../../../../shared/components/forms/FormField';
import { Spinner } from '../../../../../../../shared/components/ui/Spinner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../../../../shared/components/ui/Tabs';
import { Modal } from '../../../../../../../shared/components/ui/Modal';
import { productsService, CreateProductData, CreateVariantData } from '../../../../../../../shared/services/products.service';
import { brandsService } from '../../../../../../../shared/services/brands.service';
import { categoriesService } from '../../../../../../../shared/services/categories.service';
import { toast } from '../../../../../../../shared/stores/uiStore';
import { ProductStatus } from '../../../../../../../shared/types';

const statusOptions: SelectOption[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

const defaultVariant: CreateVariantData = {
  sku: '',
  size: '',
  color: '',
  color_hex: '',
  price_modifier: 0,
  stock_quantity: 0,
  is_active: true,
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const productId = params.id as string;
  const initialTab = searchParams.get('tab') || 'details';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [formData, setFormData] = useState<Partial<CreateProductData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [variantForm, setVariantForm] = useState<CreateVariantData>(defaultVariant);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsService.getProduct(productId),
    enabled: !!productId,
  });

  const { data: brandsData } = useQuery({
    queryKey: ['brands-all'],
    queryFn: () => brandsService.getAll({ limit: 100 }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: () => categoriesService.getTree(),
  });

  const { data: branchesData } = useQuery({
    queryKey: ['brand-branches', selectedBrandId],
    queryFn: () => brandsService.getBranches(selectedBrandId),
    enabled: !!selectedBrandId,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        brand_id: product.brand_id,
        branch_id: product.branch_id,
        category_id: product.category_id,
        name: product.name,
        sku: product.sku,
        description: product.description,
        short_description: product.short_description,
        price: product.price,
        compare_at_price: product.compare_at_price,
        cost_price: product.cost_price,
        status: product.status,
        is_featured: product.is_featured,
        stock_quantity: product.stock_quantity,
        low_stock_threshold: product.low_stock_threshold,
        tags: product.tags,
      });
      setSelectedBrandId(product.brand_id);
    }
  }, [product]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateProductData>) =>
      productsService.updateProduct(productId, data),
    onSuccess: () => {
      toast.success('Product updated successfully');
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update product');
    },
  });

  const createVariantMutation = useMutation({
    mutationFn: (data: CreateVariantData) =>
      productsService.createVariant(productId, data),
    onSuccess: () => {
      toast.success('Variant created');
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      setShowVariantModal(false);
      setVariantForm(defaultVariant);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create variant');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.sku?.trim()) newErrors.sku = 'SKU is required';
    if (!formData.brand_id) newErrors.brand_id = 'Brand is required';
    if (!formData.branch_id) newErrors.branch_id = 'Branch is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be greater than 0';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      updateMutation.mutate(formData);
    }
  };

  const handleChange = (field: keyof CreateProductData, value: unknown) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId);
    setFormData({ ...formData, brand_id: brandId, branch_id: '' });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag),
    });
  };

  const handleVariantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantForm.sku.trim()) {
      toast.error('Variant SKU is required');
      return;
    }
    createVariantMutation.mutate(variantForm);
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
        <Package className="h-12 w-12 text-text-muted mx-auto mb-4" />
        <p className="text-text-secondary mb-4">Product not found</p>
        <Button variant="secondary" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`Edit: ${product.name}`}
        description={`SKU: ${product.sku}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Products', href: '/products' },
          { label: product.name, href: `/products/${productId}` },
          { label: 'Edit' },
        ]}
        actions={
          <Button variant="secondary" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="variants">Variants ({product.variants?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField label="Product Name" required error={errors.name}>
                      <Input
                        placeholder="Enter product name"
                        value={formData.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                      />
                    </FormField>

                    <FormField label="SKU" required error={errors.sku}>
                      <Input
                        placeholder="Product SKU"
                        value={formData.sku || ''}
                        onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
                        className="uppercase"
                      />
                    </FormField>

                    <FormField label="Short Description">
                      <Input
                        placeholder="Brief description for product cards"
                        value={formData.short_description || ''}
                        onChange={(e) => handleChange('short_description', e.target.value)}
                      />
                    </FormField>

                    <FormField label="Full Description">
                      <textarea
                        placeholder="Detailed product description"
                        value={formData.description || ''}
                        onChange={(e) => handleChange('description', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:border-border-focus bg-background-surface"
                      />
                    </FormField>
                  </CardContent>
                </Card>

                {/* Organization */}
                <Card>
                  <CardHeader>
                    <CardTitle>Organization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Brand" required error={errors.brand_id}>
                        <Select
                          options={[
                            { value: '', label: 'Select brand' },
                            ...(brandsData?.brands || []).map((b) => ({
                              value: b.id,
                              label: b.name,
                            })),
                          ]}
                          value={formData.brand_id || ''}
                          onChange={(e) => handleBrandChange(e.target.value)}
                        />
                      </FormField>

                      <FormField label="Branch" required error={errors.branch_id}>
                        <Select
                          options={[
                            { value: '', label: selectedBrandId ? 'Select branch' : 'Select brand first' },
                            ...(branchesData || []).map((b) => ({
                              value: b.id,
                              label: b.name,
                            })),
                          ]}
                          value={formData.branch_id || ''}
                          onChange={(e) => handleChange('branch_id', e.target.value)}
                          disabled={!selectedBrandId}
                        />
                      </FormField>
                    </div>

                    <FormField label="Category" required error={errors.category_id}>
                      <Select
                        options={[
                          { value: '', label: 'Select category' },
                          ...(categoriesData || []).flatMap((cat) => [
                            { value: cat.id, label: cat.name },
                            ...(cat.children || []).map((child) => ({
                              value: child.id,
                              label: `  ${child.name}`,
                            })),
                          ]),
                        ]}
                        value={formData.category_id || ''}
                        onChange={(e) => handleChange('category_id', e.target.value)}
                      />
                    </FormField>

                    <FormField label="Tags">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                        />
                        <Button type="button" variant="secondary" onClick={addTag}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {formData.tags && formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-background-secondary rounded text-sm"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="text-text-muted hover:text-text-primary"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </FormField>
                  </CardContent>
                </Card>

                {/* Pricing */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <FormField label="Price (UZS)" required error={errors.price}>
                        <Input
                          type="number"
                          placeholder="0"
                          value={formData.price || ''}
                          onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                        />
                      </FormField>

                      <FormField label="Compare at Price">
                        <Input
                          type="number"
                          placeholder="0"
                          value={formData.compare_at_price || ''}
                          onChange={(e) =>
                            handleChange('compare_at_price', parseFloat(e.target.value) || undefined)
                          }
                        />
                      </FormField>

                      <FormField label="Cost Price">
                        <Input
                          type="number"
                          placeholder="0"
                          value={formData.cost_price || ''}
                          onChange={(e) =>
                            handleChange('cost_price', parseFloat(e.target.value) || undefined)
                          }
                        />
                      </FormField>
                    </div>
                  </CardContent>
                </Card>

                {/* Inventory */}
                <Card>
                  <CardHeader>
                    <CardTitle>Inventory</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Stock Quantity">
                        <Input
                          type="number"
                          placeholder="0"
                          value={formData.stock_quantity || ''}
                          onChange={(e) =>
                            handleChange('stock_quantity', parseInt(e.target.value) || 0)
                          }
                        />
                      </FormField>

                      <FormField label="Low Stock Threshold">
                        <Input
                          type="number"
                          placeholder="10"
                          value={formData.low_stock_threshold || ''}
                          onChange={(e) =>
                            handleChange('low_stock_threshold', parseInt(e.target.value) || 10)
                          }
                        />
                      </FormField>
                    </div>
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
                    <FormField label="Product Status">
                      <Select
                        options={statusOptions}
                        value={formData.status || 'draft'}
                        onChange={(e) => handleChange('status', e.target.value as ProductStatus)}
                      />
                    </FormField>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_featured || false}
                        onChange={(e) => handleChange('is_featured', e.target.checked)}
                        className="w-4 h-4 rounded border-border-primary text-button-primary-bg focus:ring-button-primary-bg"
                      />
                      <span className="text-sm text-text-primary">Featured Product</span>
                    </label>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <Button
                        type="submit"
                        className="w-full"
                        loading={updateMutation.isPending}
                      >
                        Save Changes
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                        onClick={() => router.push(`/products/${productId}`)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="variants">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Product Variants</CardTitle>
              <Button onClick={() => setShowVariantModal(true)}>
                <Plus className="h-4 w-4" />
                Add Variant
              </Button>
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
                          <td className="px-4 py-3 text-sm">{variant.size || '-'}</td>
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
                          <td className="px-4 py-3 text-sm">
                            {variant.price_modifier !== 0
                              ? `${variant.price_modifier > 0 ? '+' : ''}${variant.price_modifier.toLocaleString()} UZS`
                              : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {variant.stock_quantity}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {variant.is_active ? 'Active' : 'Inactive'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-text-muted">No variants yet. Add one to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Variant Modal */}
      <Modal
        isOpen={showVariantModal}
        onClose={() => setShowVariantModal(false)}
        title="Add Variant"
      >
        <form onSubmit={handleVariantSubmit} className="space-y-4">
          <FormField label="SKU" required>
            <Input
              placeholder="Variant SKU"
              value={variantForm.sku}
              onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value.toUpperCase() })}
              className="uppercase"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Size">
              <Input
                placeholder="e.g., M, L, XL"
                value={variantForm.size || ''}
                onChange={(e) => setVariantForm({ ...variantForm, size: e.target.value })}
              />
            </FormField>

            <FormField label="Color">
              <Input
                placeholder="e.g., Black, Red"
                value={variantForm.color || ''}
                onChange={(e) => setVariantForm({ ...variantForm, color: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Color Hex">
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={variantForm.color_hex || '#000000'}
                  onChange={(e) => setVariantForm({ ...variantForm, color_hex: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  placeholder="#000000"
                  value={variantForm.color_hex || ''}
                  onChange={(e) => setVariantForm({ ...variantForm, color_hex: e.target.value })}
                />
              </div>
            </FormField>

            <FormField label="Price Modifier">
              <Input
                type="number"
                placeholder="0"
                value={variantForm.price_modifier || ''}
                onChange={(e) =>
                  setVariantForm({ ...variantForm, price_modifier: parseFloat(e.target.value) || 0 })
                }
              />
            </FormField>
          </div>

          <FormField label="Stock Quantity">
            <Input
              type="number"
              placeholder="0"
              value={variantForm.stock_quantity || ''}
              onChange={(e) =>
                setVariantForm({ ...variantForm, stock_quantity: parseInt(e.target.value) || 0 })
              }
            />
          </FormField>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={variantForm.is_active}
              onChange={(e) => setVariantForm({ ...variantForm, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-border-primary"
            />
            <span className="text-sm text-text-primary">Active</span>
          </label>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowVariantModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createVariantMutation.isPending}>
              Add Variant
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
