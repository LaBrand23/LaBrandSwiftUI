'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Tag, Percent, DollarSign, Loader2 } from 'lucide-react';
import { PageHeader } from '../../../../../../../shared/components/layouts/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../../shared/components/ui/Card';
import { Button } from '../../../../../../../shared/components/ui/Button';
import { Input } from '../../../../../../../shared/components/ui/Input';
import { Select, SelectOption } from '../../../../../../../shared/components/ui/Select';
import { FormField } from '../../../../../../../shared/components/forms/FormField';
import { Spinner } from '../../../../../../../shared/components/ui/Spinner';
import { promoCodesService, UpdatePromoCodePayload } from '../../../../../../../shared/services/promo-codes.service';
import { brandsService } from '../../../../../../../shared/services/brands.service';
import { categoriesService } from '../../../../../../../shared/services/categories.service';
import { toast } from '../../../../../../../shared/stores/uiStore';

const typeOptions: SelectOption[] = [
  { value: 'percentage', label: 'Percentage Discount' },
  { value: 'fixed', label: 'Fixed Amount' },
];

export default function EditPromoCodePage() {
  const router = useRouter();
  const params = useParams();
  const promoCodeId = params.id as string;

  const [formData, setFormData] = useState<UpdatePromoCodePayload>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: promoCode, isLoading } = useQuery({
    queryKey: ['promo-code', promoCodeId],
    queryFn: () => promoCodesService.getById(promoCodeId),
    enabled: !!promoCodeId,
  });

  const { data: brandsData } = useQuery({
    queryKey: ['brands-all'],
    queryFn: () => brandsService.getAll({ limit: 100 }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: () => categoriesService.getTree(),
  });

  useEffect(() => {
    if (promoCode) {
      setFormData({
        code: promoCode.code,
        type: promoCode.type,
        value: promoCode.value,
        min_order_amount: promoCode.min_order_amount,
        max_discount: promoCode.max_discount,
        usage_limit: promoCode.usage_limit,
        per_user_limit: promoCode.per_user_limit,
        valid_from: promoCode.valid_from.split('T')[0],
        valid_to: promoCode.valid_to.split('T')[0],
        applicable_brands: promoCode.applicable_brands || [],
        applicable_categories: promoCode.applicable_categories || [],
        is_active: promoCode.is_active,
      });
    }
  }, [promoCode]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdatePromoCodePayload) => promoCodesService.update(promoCodeId, data),
    onSuccess: () => {
      toast.success('Promo code updated successfully');
      router.push('/promo-codes');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update promo code');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      newErrors.code = 'Code is required';
    } else if (formData.code.length < 3) {
      newErrors.code = 'Code must be at least 3 characters';
    }

    if (!formData.value || formData.value <= 0) {
      newErrors.value = 'Value must be greater than 0';
    }

    if (formData.type === 'percentage' && formData.value && formData.value > 100) {
      newErrors.value = 'Percentage cannot exceed 100%';
    }

    if (!formData.valid_from) {
      newErrors.valid_from = 'Start date is required';
    }

    if (!formData.valid_to) {
      newErrors.valid_to = 'End date is required';
    }

    if (formData.valid_from && formData.valid_to && formData.valid_from > formData.valid_to) {
      newErrors.valid_to = 'End date must be after start date';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      updateMutation.mutate({
        ...formData,
        code: formData.code?.toUpperCase(),
      });
    }
  };

  const handleChange = (field: keyof UpdatePromoCodePayload, value: unknown) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!promoCode) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Promo code not found</p>
        <Button variant="secondary" onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`Edit: ${promoCode.code}`}
        description="Update promo code details"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Promo Codes', href: '/promo-codes' },
          { label: promoCode.code },
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
                <FormField label="Promo Code" required error={errors.code}>
                  <Input
                    placeholder="e.g., SUMMER20"
                    value={formData.code || ''}
                    onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                    leftIcon={<Tag className="h-4 w-4" />}
                    className="uppercase"
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Discount Type" required>
                    <Select
                      options={typeOptions}
                      value={formData.type || 'percentage'}
                      onChange={(e) => handleChange('type', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Discount Value" required error={errors.value}>
                    <Input
                      type="number"
                      placeholder={formData.type === 'percentage' ? '20' : '50000'}
                      value={formData.value || ''}
                      onChange={(e) => handleChange('value', parseFloat(e.target.value) || 0)}
                      leftIcon={
                        formData.type === 'percentage' ? (
                          <Percent className="h-4 w-4" />
                        ) : (
                          <DollarSign className="h-4 w-4" />
                        )
                      }
                    />
                  </FormField>
                </div>

                {formData.type === 'percentage' && (
                  <FormField label="Maximum Discount Amount" hint="Optional - caps the discount amount">
                    <Input
                      type="number"
                      placeholder="100000"
                      value={formData.max_discount || ''}
                      onChange={(e) =>
                        handleChange('max_discount', parseFloat(e.target.value) || undefined)
                      }
                    />
                  </FormField>
                )}

                <FormField label="Minimum Order Amount" hint="Optional - minimum order value to apply discount">
                  <Input
                    type="number"
                    placeholder="200000"
                    value={formData.min_order_amount || ''}
                    onChange={(e) =>
                      handleChange('min_order_amount', parseFloat(e.target.value) || undefined)
                    }
                  />
                </FormField>
              </CardContent>
            </Card>

            {/* Usage Limits */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Total Usage Limit" hint="Leave empty for unlimited">
                    <Input
                      type="number"
                      placeholder="100"
                      value={formData.usage_limit || ''}
                      onChange={(e) =>
                        handleChange('usage_limit', parseInt(e.target.value) || undefined)
                      }
                    />
                  </FormField>

                  <FormField label="Per User Limit" hint="How many times one user can use">
                    <Input
                      type="number"
                      placeholder="1"
                      value={formData.per_user_limit || ''}
                      onChange={(e) =>
                        handleChange('per_user_limit', parseInt(e.target.value) || undefined)
                      }
                    />
                  </FormField>
                </div>

                {/* Usage Stats */}
                <div className="p-4 bg-background-secondary rounded-lg">
                  <p className="text-sm text-text-muted mb-2">Current Usage</p>
                  <p className="text-2xl font-semibold text-text-primary">
                    {promoCode.used_count}
                    {promoCode.usage_limit && (
                      <span className="text-text-muted text-base font-normal">
                        {' '}
                        / {promoCode.usage_limit}
                      </span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Validity Period */}
            <Card>
              <CardHeader>
                <CardTitle>Validity Period</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Start Date" required error={errors.valid_from}>
                    <Input
                      type="date"
                      value={formData.valid_from || ''}
                      onChange={(e) => handleChange('valid_from', e.target.value)}
                    />
                  </FormField>

                  <FormField label="End Date" required error={errors.valid_to}>
                    <Input
                      type="date"
                      value={formData.valid_to || ''}
                      onChange={(e) => handleChange('valid_to', e.target.value)}
                    />
                  </FormField>
                </div>
              </CardContent>
            </Card>

            {/* Restrictions */}
            <Card>
              <CardHeader>
                <CardTitle>Restrictions (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField label="Applicable Brands" hint="Leave empty to apply to all brands">
                  <Select
                    options={[
                      { value: '', label: 'All Brands' },
                      ...(brandsData?.brands || []).map((brand) => ({
                        value: brand.id,
                        label: brand.name,
                      })),
                    ]}
                    value=""
                    onChange={(e) => {
                      if (e.target.value && !formData.applicable_brands?.includes(e.target.value)) {
                        handleChange('applicable_brands', [
                          ...(formData.applicable_brands || []),
                          e.target.value,
                        ]);
                      }
                    }}
                  />
                  {formData.applicable_brands && formData.applicable_brands.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.applicable_brands.map((brandId) => {
                        const brand = brandsData?.brands.find((b) => b.id === brandId);
                        return (
                          <span
                            key={brandId}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-background-secondary rounded text-sm"
                          >
                            {brand?.name || brandId}
                            <button
                              type="button"
                              onClick={() =>
                                handleChange(
                                  'applicable_brands',
                                  formData.applicable_brands?.filter((id) => id !== brandId)
                                )
                              }
                              className="text-text-muted hover:text-text-primary"
                            >
                              &times;
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </FormField>

                <FormField label="Applicable Categories" hint="Leave empty to apply to all categories">
                  <Select
                    options={[
                      { value: '', label: 'All Categories' },
                      ...(categoriesData || []).map((cat) => ({
                        value: cat.id,
                        label: cat.name,
                      })),
                    ]}
                    value=""
                    onChange={(e) => {
                      if (
                        e.target.value &&
                        !formData.applicable_categories?.includes(e.target.value)
                      ) {
                        handleChange('applicable_categories', [
                          ...(formData.applicable_categories || []),
                          e.target.value,
                        ]);
                      }
                    }}
                  />
                  {formData.applicable_categories && formData.applicable_categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.applicable_categories.map((catId) => {
                        const category = categoriesData?.find((c) => c.id === catId);
                        return (
                          <span
                            key={catId}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-background-secondary rounded text-sm"
                          >
                            {category?.name || catId}
                            <button
                              type="button"
                              onClick={() =>
                                handleChange(
                                  'applicable_categories',
                                  formData.applicable_categories?.filter((id) => id !== catId)
                                )
                              }
                              className="text-text-muted hover:text-text-primary"
                            >
                              &times;
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </FormField>
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
              <CardContent>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active ?? true}
                    onChange={(e) => handleChange('is_active', e.target.checked)}
                    className="w-4 h-4 rounded border-border-primary text-button-primary-bg focus:ring-button-primary-bg"
                  />
                  <span className="text-sm text-text-primary">Active</span>
                </label>
                <p className="text-xs text-text-muted mt-2">
                  Active promo codes can be used by customers during checkout.
                </p>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Code:</span>
                  <span className="font-mono font-medium">
                    {formData.code || '---'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Discount:</span>
                  <span className="font-medium">
                    {formData.type === 'percentage'
                      ? `${formData.value || 0}%`
                      : `${(formData.value || 0).toLocaleString()} UZS`}
                  </span>
                </div>
                {formData.min_order_amount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Min Order:</span>
                    <span>{formData.min_order_amount.toLocaleString()} UZS</span>
                  </div>
                )}
                {formData.max_discount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Max Discount:</span>
                    <span>{formData.max_discount.toLocaleString()} UZS</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Times Used:</span>
                  <span>{promoCode.used_count}</span>
                </div>
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
