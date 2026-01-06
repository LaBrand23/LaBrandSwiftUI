'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Building2, Globe, Image as ImageIcon, MapPin, Plus, Trash2, Edit } from 'lucide-react';
import { PageHeader } from '../../../../../../../shared/components/layouts/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../../shared/components/ui/Card';
import { Button } from '../../../../../../../shared/components/ui/Button';
import { Input } from '../../../../../../../shared/components/ui/Input';
import { FormField } from '../../../../../../../shared/components/forms/FormField';
import { Spinner } from '../../../../../../../shared/components/ui/Spinner';
import { Modal } from '../../../../../../../shared/components/ui/Modal';
import { Badge } from '../../../../../../../shared/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../../../../shared/components/ui/Tabs';
import { brandsService, CreateBrandData, CreateBranchData } from '../../../../../../../shared/services/brands.service';
import { toast } from '../../../../../../../shared/stores/uiStore';
import { Branch } from '../../../../../../../shared/types';

const defaultBranch: CreateBranchData = {
  name: '',
  city: '',
  district: '',
  address: '',
  phone: '',
};

export default function EditBrandPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const brandId = params.id as string;
  const initialTab = searchParams.get('tab') || 'details';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [formData, setFormData] = useState<Partial<CreateBrandData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [branchModal, setBranchModal] = useState<{ open: boolean; branch: Branch | null }>({
    open: false,
    branch: null,
  });
  const [branchForm, setBranchForm] = useState<CreateBranchData>(defaultBranch);
  const [branchErrors, setBranchErrors] = useState<Record<string, string>>({});

  const { data: brand, isLoading } = useQuery({
    queryKey: ['brand', brandId],
    queryFn: () => brandsService.getBrand(brandId),
    enabled: !!brandId,
  });

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name,
        slug: brand.slug,
        logo_url: brand.logo_url,
        description: brand.description,
        website: brand.website,
        is_featured: brand.is_featured,
      });
    }
  }, [brand]);

  useEffect(() => {
    const branchId = searchParams.get('branch');
    if (branchId && brand?.branches) {
      const branch = brand.branches.find((b) => b.id === branchId);
      if (branch) {
        openBranchModal(branch);
      }
    }
  }, [searchParams, brand]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateBrandData>) => brandsService.updateBrand(brandId, data),
    onSuccess: () => {
      toast.success('Brand updated successfully');
      queryClient.invalidateQueries({ queryKey: ['brand', brandId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update brand');
    },
  });

  const createBranchMutation = useMutation({
    mutationFn: (data: CreateBranchData) => brandsService.createBranch(brandId, data),
    onSuccess: () => {
      toast.success('Branch created');
      queryClient.invalidateQueries({ queryKey: ['brand', brandId] });
      closeBranchModal();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create branch');
    },
  });

  const updateBranchMutation = useMutation({
    mutationFn: ({ branchId, data }: { branchId: string; data: Partial<CreateBranchData> }) =>
      brandsService.updateBranch(brandId, branchId, data),
    onSuccess: () => {
      toast.success('Branch updated');
      queryClient.invalidateQueries({ queryKey: ['brand', brandId] });
      closeBranchModal();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update branch');
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

    if (!formData.name?.trim()) {
      newErrors.name = 'Brand name is required';
    }

    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = 'Website must be a valid URL';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      updateMutation.mutate(formData);
    }
  };

  const handleChange = (field: keyof CreateBrandData, value: unknown) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const openBranchModal = (branch: Branch | null = null) => {
    if (branch) {
      setBranchForm({
        name: branch.name,
        city: branch.city,
        district: branch.district || '',
        address: branch.address,
        phone: branch.phone || '',
      });
    } else {
      setBranchForm(defaultBranch);
    }
    setBranchModal({ open: true, branch });
    setBranchErrors({});
  };

  const closeBranchModal = () => {
    setBranchModal({ open: false, branch: null });
    setBranchForm(defaultBranch);
    setBranchErrors({});
  };

  const handleBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!branchForm.name.trim()) newErrors.name = 'Branch name is required';
    if (!branchForm.city.trim()) newErrors.city = 'City is required';
    if (!branchForm.address.trim()) newErrors.address = 'Address is required';

    setBranchErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      if (branchModal.branch) {
        updateBranchMutation.mutate({ branchId: branchModal.branch.id, data: branchForm });
      } else {
        createBranchMutation.mutate(branchForm);
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

  if (!brand) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-text-muted mx-auto mb-4" />
        <p className="text-text-secondary mb-4">Brand not found</p>
        <Button variant="secondary" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`Edit: ${brand.name}`}
        description="Update brand information"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Brands', href: '/brands' },
          { label: brand.name, href: `/brands/${brandId}` },
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
          <TabsTrigger value="details">Brand Details</TabsTrigger>
          <TabsTrigger value="branches">Branches ({brand.branches?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField label="Brand Name" required error={errors.name}>
                      <Input
                        placeholder="Enter brand name"
                        value={formData.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        leftIcon={<Building2 className="h-4 w-4" />}
                      />
                    </FormField>

                    <FormField label="Slug">
                      <Input
                        placeholder="brand-slug"
                        value={formData.slug || ''}
                        onChange={(e) =>
                          handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                        }
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

                <Card>
                  <CardHeader>
                    <CardTitle>Brand Logo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField label="Logo URL">
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
                          />
                        </div>
                        <p className="text-sm text-text-muted">Logo preview</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_featured || false}
                        onChange={(e) => handleChange('is_featured', e.target.checked)}
                        className="w-4 h-4 rounded border-border-primary text-button-primary-bg focus:ring-button-primary-bg"
                      />
                      <div>
                        <span className="text-sm text-text-primary">Featured Brand</span>
                        <p className="text-xs text-text-muted">Show prominently in the app</p>
                      </div>
                    </label>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <Button type="submit" className="w-full" loading={updateMutation.isPending}>
                        Save Changes
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                        onClick={() => router.push(`/brands/${brandId}`)}
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

        <TabsContent value="branches">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Branches</CardTitle>
              <Button onClick={() => openBranchModal()}>
                <Plus className="h-4 w-4" />
                Add Branch
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {brand.branches && brand.branches.length > 0 ? (
                <div className="divide-y divide-border-subtle">
                  {brand.branches.map((branch) => (
                    <div
                      key={branch.id}
                      className="flex items-center justify-between p-4 hover:bg-background-secondary"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-background-secondary flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-text-muted" />
                        </div>
                        <div>
                          <p className="font-medium">{branch.name}</p>
                          <p className="text-sm text-text-muted">
                            {branch.city}
                            {branch.district && `, ${branch.district}`}
                          </p>
                          <p className="text-xs text-text-tertiary">{branch.address}</p>
                          {branch.phone && (
                            <p className="text-xs text-text-muted">{branch.phone}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={branch.is_active ? 'success' : 'secondary'}>
                          {branch.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button variant="ghost" size="icon-sm" onClick={() => openBranchModal(branch)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-text-muted mx-auto mb-2 opacity-50" />
                  <p className="text-text-muted mb-4">No branches yet</p>
                  <Button onClick={() => openBranchModal()}>
                    <Plus className="h-4 w-4" />
                    Add First Branch
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Branch Modal */}
      <Modal
        isOpen={branchModal.open}
        onClose={closeBranchModal}
        title={branchModal.branch ? 'Edit Branch' : 'Add Branch'}
      >
        <form onSubmit={handleBranchSubmit} className="space-y-4">
          <FormField label="Branch Name" required error={branchErrors.name}>
            <Input
              placeholder="e.g., Tashkent Main Store"
              value={branchForm.name}
              onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="City" required error={branchErrors.city}>
              <Input
                placeholder="e.g., Tashkent"
                value={branchForm.city}
                onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
              />
            </FormField>

            <FormField label="District">
              <Input
                placeholder="e.g., Chilanzar"
                value={branchForm.district || ''}
                onChange={(e) => setBranchForm({ ...branchForm, district: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Full Address" required error={branchErrors.address}>
            <Input
              placeholder="Street, building, etc."
              value={branchForm.address}
              onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
            />
          </FormField>

          <FormField label="Phone Number">
            <Input
              placeholder="+998 xx xxx xx xx"
              value={branchForm.phone || ''}
              onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeBranchModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createBranchMutation.isPending || updateBranchMutation.isPending}
            >
              {branchModal.branch ? 'Save Changes' : 'Add Branch'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
