'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../../../../../../shared/components/layouts/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../shared/components/ui/Card';
import { Button } from '../../../../../../shared/components/ui/Button';
import { Input } from '../../../../../../shared/components/ui/Input';
import { Select, SelectOption } from '../../../../../../shared/components/ui/Select';
import { FormField } from '../../../../../../shared/components/forms/FormField';
import { productsService, CreateProductData } from '../../../../../../shared/services/products.service';
import { brandsService } from '../../../../../../shared/services/brands.service';
import { categoriesService } from '../../../../../../shared/services/categories.service';
import { toast } from '../../../../../../shared/stores/uiStore';
import { ProductStatus } from '../../../../../../shared/types';

const statusOptions: SelectOption[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

export default function NewProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateProductData>({
    brand_id: '',
    branch_id: '',
    category_id: '',
    name: '',
    sku: '',
    description: '',
    short_description: '',
    price: 0,
    compare_at_price: undefined,
    cost_price: undefined,
    status: 'draft',
    is_featured: false,
    stock_quantity: 0,
    low_stock_threshold: 10,
    images: [],
    tags: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState('');

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

  const createMutation = useMutation({
    mutationFn: (data: CreateProductData) => productsService.createProduct(data),
    onSuccess: (product) => {
      toast.success('Product created successfully');
      router.push(`/products/${product.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create product');
    },
  });

  const generateSku = () => {
    const prefix = formData.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData({ ...formData, sku: `${prefix}-${random}` });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.brand_id) newErrors.brand_id = 'Brand is required';
    if (!formData.branch_id) newErrors.branch_id = 'Branch is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be greater than 0';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      createMutation.mutate(formData);
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

  return (
    <>
      <PageHeader
        title="Create Product"
        description="Add a new product to the catalog"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Products', href: '/products' },
          { label: 'Create' },
        ]}
        actions={
          <Button variant="secondary" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        }
      />

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
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </FormField>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <FormField label="SKU" required error={errors.sku}>
                      <Input
                        placeholder="Product SKU"
                        value={formData.sku}
                        onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
                        className="uppercase"
                      />
                    </FormField>
                  </div>
                  <Button type="button" variant="secondary" onClick={generateSku} className="mt-6">
                    Generate
                  </Button>
                </div>

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
                      value={formData.brand_id}
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
                      value={formData.branch_id}
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
                    value={formData.category_id}
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

                  <FormField label="Compare at Price" hint="Original price for sale display">
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.compare_at_price || ''}
                      onChange={(e) =>
                        handleChange('compare_at_price', parseFloat(e.target.value) || undefined)
                      }
                    />
                  </FormField>

                  <FormField label="Cost Price" hint="Your cost (not shown to customers)">
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
                  <FormField label="Stock Quantity" required>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.stock_quantity || ''}
                      onChange={(e) =>
                        handleChange('stock_quantity', parseInt(e.target.value) || 0)
                      }
                    />
                  </FormField>

                  <FormField label="Low Stock Threshold" hint="Alert when stock falls below">
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
                    checked={formData.is_featured}
                    onChange={(e) => handleChange('is_featured', e.target.checked)}
                    className="w-4 h-4 rounded border-border-primary text-button-primary-bg focus:ring-button-primary-bg"
                  />
                  <span className="text-sm text-text-primary">Featured Product</span>
                </label>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border-primary rounded-lg p-8 text-center">
                  <Package className="h-10 w-10 text-text-muted mx-auto mb-3" />
                  <p className="text-sm text-text-muted mb-2">
                    Drag and drop images here
                  </p>
                  <p className="text-xs text-text-muted">
                    Or click to select files
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      // Handle file upload - would integrate with storage service
                      toast.info('Image upload will be integrated with storage service');
                    }}
                  />
                </div>
                <p className="text-xs text-text-muted mt-2">
                  Supports: JPG, PNG, WebP. Max 5MB per image.
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    loading={createMutation.isPending}
                  >
                    Create Product
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </>
  );
}
