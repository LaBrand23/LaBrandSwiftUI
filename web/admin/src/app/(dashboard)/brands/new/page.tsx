'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Building2, Globe, Image as ImageIcon } from 'lucide-react';
import { PageHeader } from '../../../../../../shared/components/layouts/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../shared/components/ui/Card';
import { Button } from '../../../../../../shared/components/ui/Button';
import { Input } from '../../../../../../shared/components/ui/Input';
import { FormField } from '../../../../../../shared/components/forms/FormField';
import { brandsService, CreateBrandData } from '../../../../../../shared/services/brands.service';
import { toast } from '../../../../../../shared/stores/uiStore';

export default function NewBrandPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateBrandData>({
    name: '',
    slug: '',
    logo_url: '',
    description: '',
    website: '',
    is_featured: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useMutation({
    mutationFn: (data: CreateBrandData) => brandsService.createBrand(data),
    onSuccess: (brand) => {
      toast.success('Brand created successfully');
      router.push(`/brands/${brand.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create brand');
    },
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Brand name is required';
    }

    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = 'Website must be a valid URL (http:// or https://)';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      createMutation.mutate({
        ...formData,
        slug: formData.slug || generateSlug(formData.name),
      });
    }
  };

  const handleChange = (field: keyof CreateBrandData, value: unknown) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <>
      <PageHeader
        title="Create Brand"
        description="Add a new brand to the platform"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Brands', href: '/brands' },
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
                <FormField label="Brand Name" required error={errors.name}>
                  <Input
                    placeholder="Enter brand name"
                    value={formData.name}
                    onChange={(e) => {
                      handleChange('name', e.target.value);
                      if (!formData.slug) {
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                          slug: generateSlug(e.target.value),
                        }));
                      }
                    }}
                    leftIcon={<Building2 className="h-4 w-4" />}
                  />
                </FormField>

                <FormField
                  label="Slug"
                  hint="URL-friendly identifier (auto-generated from name)"
                >
                  <Input
                    placeholder="brand-slug"
                    value={formData.slug || ''}
                    onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  />
                </FormField>

                <FormField label="Description">
                  <textarea
                    placeholder="Brief description of the brand"
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:border-border-focus bg-background-surface"
                  />
                </FormField>

                <FormField label="Website" error={errors.website}>
                  <Input
                    placeholder="https://example.com"
                    value={formData.website || ''}
                    onChange={(e) => handleChange('website', e.target.value)}
                    leftIcon={<Globe className="h-4 w-4" />}
                  />
                </FormField>
              </CardContent>
            </Card>

            {/* Logo */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Logo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField label="Logo URL" hint="Direct URL to the brand logo image">
                  <Input
                    placeholder="https://example.com/logo.png"
                    value={formData.logo_url || ''}
                    onChange={(e) => handleChange('logo_url', e.target.value)}
                    leftIcon={<ImageIcon className="h-4 w-4" />}
                  />
                </FormField>

                {formData.logo_url && (
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-background-secondary rounded-lg overflow-hidden">
                      <img
                        src={formData.logo_url}
                        alt="Logo preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <p className="text-sm text-text-muted">Logo preview</p>
                  </div>
                )}

                <div className="border-2 border-dashed border-border-primary rounded-lg p-6 text-center">
                  <ImageIcon className="h-8 w-8 text-text-muted mx-auto mb-2" />
                  <p className="text-sm text-text-muted">
                    Or drag and drop an image here
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">
                    PNG, JPG up to 2MB
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => handleChange('is_featured', e.target.checked)}
                    className="w-4 h-4 rounded border-border-primary text-button-primary-bg focus:ring-button-primary-bg"
                  />
                  <div>
                    <span className="text-sm text-text-primary">Featured Brand</span>
                    <p className="text-xs text-text-muted">
                      Featured brands appear prominently in the app
                    </p>
                  </div>
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
                    loading={createMutation.isPending}
                  >
                    Create Brand
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

            {/* Info */}
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-text-muted">
                  After creating the brand, you'll be able to add branches and assign managers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </>
  );
}
