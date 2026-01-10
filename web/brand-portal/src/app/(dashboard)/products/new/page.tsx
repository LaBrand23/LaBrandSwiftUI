'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@shared/stores/authStore';
import { toast } from '@shared/stores/uiStore';
import { productsService, CreateProductData } from '@shared/services/products.service';
import { categoriesService } from '@shared/services/categories.service';
import { Gender } from '@shared/types';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { Select } from '@shared/components/ui/Select';
import { Spinner } from '@shared/components/ui/Spinner';
import {
  ArrowLeftIcon,
  PhotoIcon,
  PlusIcon,
  XMarkIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

const genderOptions = [
  { value: '', label: 'Select Gender' },
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'kids', label: 'Kids' },
  { value: 'unisex', label: 'Unisex' },
];

const statusOptions = [
  { value: 'draft', label: 'Draft - Not visible to customers' },
  { value: 'active', label: 'Active - Visible to customers' },
];

interface FormData {
  name: string;
  sku: string;
  description: string;
  price: string;
  compare_at_price: string;
  cost_per_item: string;
  category_id: string;
  gender: Gender | '';
  stock_quantity: string;
  low_stock_threshold: string;
  images: string[];
  tags: string[];
  status: 'draft' | 'active';
}

const initialFormData: FormData = {
  name: '',
  sku: '',
  description: '',
  price: '',
  compare_at_price: '',
  cost_per_item: '',
  category_id: '',
  gender: '',
  stock_quantity: '0',
  low_stock_threshold: '5',
  images: [],
  tags: [],
  status: 'draft',
};

export default function NewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Get brand_id directly from user (not brand_assignment)
  const brandId = user?.brand_id;
  const branchId = user?.branch_id;

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newTag, setNewTag] = useState('');

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: () => categoriesService.getTree(),
  });

  const categories = categoriesData || [];

  // Flatten categories for select options
  const flattenCategories = (cats: typeof categories, prefix = ''): { value: string; label: string }[] => {
    return cats.flatMap((cat) => {
      const label = prefix ? `${prefix} > ${cat.name}` : cat.name;
      const children = cat.children ? flattenCategories(cat.children, label) : [];
      return [{ value: cat.id, label }, ...children];
    });
  };

  const categoryOptions = [
    { value: '', label: 'Select Category' },
    ...flattenCategories(categories),
  ];

  const createMutation = useMutation({
    mutationFn: (payload: CreateProductData) => productsService.createProduct(payload),
    onSuccess: (product) => {
      toast.success('Product created successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      router.push(`/products/${product.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create product');
    },
  });

  const generateSku = () => {
    const prefix = formData.name.substring(0, 3).toUpperCase() || 'PRD';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData({ ...formData, sku: `${prefix}-${random}` });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Match backend createProductSchema
      const payload: CreateProductData = {
        name: formData.name.trim(),
        category_id: formData.category_id,
        description: formData.description.trim() || undefined,
        price: parseFloat(formData.price),
        sale_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : undefined,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        is_featured: false,
        is_new: true,
      };

      createMutation.mutate(payload);
    }
  };

  const handleChange = (field: keyof FormData, value: unknown) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const addImage = () => {
    if (newImageUrl.trim() && !formData.images.includes(newImageUrl.trim())) {
      setFormData({ ...formData, images: [...formData.images, newImageUrl.trim()] });
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  if (!brandId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeftIcon className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">New Product</h1>
          <p className="text-neutral-500 mt-1">Add a new product to your catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <Input
                      label="Product Name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="e.g., Classic Cotton T-Shirt"
                      error={errors.name}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="SKU"
                        value={formData.sku}
                        onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
                        placeholder="PRD-XXXXXX"
                        error={errors.sku}
                        required
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="button" variant="outline" onClick={generateSku}>
                        Generate SKU
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Describe your product..."
                      rows={4}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Pricing */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Pricing</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Input
                      label="Price (UZS)"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleChange('price', e.target.value)}
                      placeholder="0"
                      error={errors.price}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      label="Compare at Price"
                      type="number"
                      value={formData.compare_at_price}
                      onChange={(e) => handleChange('compare_at_price', e.target.value)}
                      placeholder="Original price"
                      helper="Shows as crossed out"
                    />
                  </div>
                  <div>
                    <Input
                      label="Cost per Item"
                      type="number"
                      value={formData.cost_per_item}
                      onChange={(e) => handleChange('cost_per_item', e.target.value)}
                      placeholder="Your cost"
                      helper="For profit calculation"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Images */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Product Images</h2>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-neutral-100">
                          <img
                            src={img}
                            alt={`Product ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-error-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 text-xs bg-primary-500 text-white px-2 py-0.5 rounded">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Enter image URL"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={addImage}>
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>

                {formData.images.length === 0 && (
                  <div className="mt-4 border-2 border-dashed border-neutral-200 rounded-lg p-8 text-center">
                    <PhotoIcon className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                    <p className="text-neutral-500">No images added yet</p>
                    <p className="text-sm text-neutral-400">Add image URLs above</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Tags */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Tags</h2>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-100 rounded-full text-sm"
                      >
                        <TagIcon className="w-3 h-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-error-600"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Status</h2>
                <Select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  options={statusOptions}
                />
              </div>
            </Card>

            {/* Classification */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Classification</h2>
                <div className="space-y-4">
                  <Select
                    label="Category"
                    value={formData.category_id}
                    onChange={(e) => handleChange('category_id', e.target.value)}
                    options={categoryOptions}
                    error={errors.category_id}
                    required
                  />

                  <Select
                    label="Gender"
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    options={genderOptions}
                    error={errors.gender}
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Inventory */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Inventory</h2>
                <div className="space-y-4">
                  <Input
                    label="Stock Quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => handleChange('stock_quantity', e.target.value)}
                    min="0"
                  />

                  <Input
                    label="Low Stock Threshold"
                    type="number"
                    value={formData.low_stock_threshold}
                    onChange={(e) => handleChange('low_stock_threshold', e.target.value)}
                    min="0"
                    helper="Alert when stock falls below this"
                  />
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card>
              <div className="p-6 space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={createMutation.isPending}
                >
                  Create Product
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
