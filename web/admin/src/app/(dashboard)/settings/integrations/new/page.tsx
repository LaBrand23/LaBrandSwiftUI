'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { integrationsService, ADAPTER_CONFIGS, CreateIntegrationData } from '@shared/services/integrations.service';
import { brandsService } from '@shared/services/brands.service';
import { AdapterType, IntegrationConfig } from '@shared/types';
import { useUIStore } from '@shared/stores/uiStore';
import { PageHeader } from '@shared/components/layouts/PageHeader';
import { Button } from '@shared/components/ui/Button';
import { Card } from '@shared/components/ui/Card';
import { Input } from '@shared/components/ui/Input';
import { Select } from '@shared/components/ui/Select';
import { Spinner } from '@shared/components/ui/Spinner';
import {
  ArrowLeftIcon,
  ServerIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const adapterIcons: Record<AdapterType, typeof ServerIcon> = {
  billz: ServerIcon,
  '1c': DocumentTextIcon,
  loyverse: GlobeAltIcon,
  csv: CloudArrowUpIcon,
  webhook: GlobeAltIcon,
  custom: Cog6ToothIcon,
};

export default function NewIntegrationPage() {
  const router = useRouter();
  const { addToast } = useUIStore();

  const [step, setStep] = useState<'select' | 'configure' | 'test'>('select');
  const [selectedAdapter, setSelectedAdapter] = useState<AdapterType | null>(null);
  const [formData, setFormData] = useState<Partial<CreateIntegrationData>>({
    name: '',
    description: '',
    sync_interval_minutes: 5,
    config: {},
  });
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const { data: brandsData, isLoading: brandsLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandsService.getAll({ limit: 100 }),
  });

  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const selectedBrand = brandsData?.brands.find((b) => b.id === selectedBrandId);

  const createMutation = useMutation({
    mutationFn: (data: CreateIntegrationData) => integrationsService.create(data),
    onSuccess: (result) => {
      addToast('Integration created successfully', 'success');
      router.push(`/settings/integrations/${result.id}`);
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to create integration', 'error');
    },
  });

  const handleSelectAdapter = (adapter: AdapterType) => {
    setSelectedAdapter(adapter);
    setFormData({
      ...formData,
      adapter_type: adapter,
      name: `${ADAPTER_CONFIGS[adapter].label} Integration`,
    });
    setStep('configure');
  };

  const handleConfigChange = (key: string, value: string | boolean | number) => {
    setFormData({
      ...formData,
      config: {
        ...formData.config,
        [key]: value,
      },
    });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    // Simulate test connection (in real app, this would call the API)
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      setTestResult({
        success,
        message: success
          ? 'Connection successful! Found 150 products.'
          : 'Connection failed. Please check your credentials.',
      });
      setIsTesting(false);
      if (success) {
        setStep('test');
      }
    }, 2000);
  };

  const handleCreate = () => {
    if (!selectedAdapter || !formData.branch_id) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    createMutation.mutate({
      branch_id: formData.branch_id,
      adapter_type: selectedAdapter,
      name: formData.name || `${ADAPTER_CONFIGS[selectedAdapter].label} Integration`,
      description: formData.description,
      config: formData.config as IntegrationConfig,
      sync_interval_minutes: formData.sync_interval_minutes,
    });
  };

  const adapterConfig = selectedAdapter ? ADAPTER_CONFIGS[selectedAdapter] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Integration"
        subtitle="Connect a CRM or POS system for automatic stock sync"
        breadcrumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Integrations', href: '/settings/integrations' },
          { label: 'New' },
        ]}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Button>
        }
      />

      {/* Progress Steps */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          {['Select Type', 'Configure', 'Test & Create'].map((label, idx) => {
            const stepNum = idx + 1;
            const isActive =
              (step === 'select' && idx === 0) ||
              (step === 'configure' && idx === 1) ||
              (step === 'test' && idx === 2);
            const isCompleted =
              (step === 'configure' && idx === 0) ||
              (step === 'test' && idx <= 1);

            return (
              <div key={label} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                    isCompleted
                      ? 'bg-success-500 text-white'
                      : isActive
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-200 text-neutral-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    isActive || isCompleted
                      ? 'text-neutral-900'
                      : 'text-neutral-500'
                  }`}
                >
                  {label}
                </span>
                {idx < 2 && (
                  <div
                    className={`w-24 h-0.5 mx-4 ${
                      isCompleted ? 'bg-success-500' : 'bg-neutral-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Step 1: Select Adapter */}
      {step === 'select' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.entries(ADAPTER_CONFIGS) as [AdapterType, typeof ADAPTER_CONFIGS[AdapterType]][]).map(
            ([type, config]) => {
              const Icon = adapterIcons[type];
              return (
                <Card
                  key={type}
                  className="p-6 cursor-pointer hover:border-primary-500 hover:shadow-md transition-all"
                  onClick={() => handleSelectAdapter(type)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">
                        {config.label}
                      </h3>
                      <p className="text-sm text-neutral-500 mt-1">
                        {config.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            }
          )}
        </div>
      )}

      {/* Step 2: Configure */}
      {step === 'configure' && adapterConfig && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Basic Information
              </h2>
              <div className="space-y-4">
                <Input
                  label="Integration Name"
                  value={formData.name || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={`${adapterConfig.label} Integration`}
                />
                <Input
                  label="Description"
                  value={formData.description || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional description"
                />

                {brandsLoading ? (
                  <Spinner />
                ) : (
                  <>
                    <Select
                      label="Brand"
                      value={selectedBrandId}
                      onChange={(e) => {
                        setSelectedBrandId(e.target.value);
                        setFormData({ ...formData, branch_id: '' });
                      }}
                      options={[
                        { value: '', label: 'Select Brand' },
                        ...(brandsData?.brands.map((b) => ({
                          value: b.id,
                          label: b.name,
                        })) || []),
                      ]}
                    />

                    {selectedBrand && (
                      <Select
                        label="Branch"
                        value={formData.branch_id || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, branch_id: e.target.value })
                        }
                        options={[
                          { value: '', label: 'Select Branch' },
                          // In real app, fetch branches for selected brand
                          { value: 'branch-1', label: 'Main Branch' },
                          { value: 'branch-2', label: 'Downtown Branch' },
                        ]}
                      />
                    )}
                  </>
                )}

                <Select
                  label="Sync Interval"
                  value={formData.sync_interval_minutes?.toString() || '5'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sync_interval_minutes: parseInt(e.target.value),
                    })
                  }
                  options={[
                    { value: '5', label: 'Every 5 minutes' },
                    { value: '15', label: 'Every 15 minutes' },
                    { value: '30', label: 'Every 30 minutes' },
                    { value: '60', label: 'Every hour' },
                    { value: '360', label: 'Every 6 hours' },
                    { value: '1440', label: 'Once daily' },
                  ]}
                />
              </div>
            </Card>

            {/* Adapter-specific Config */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                {adapterConfig.label} Configuration
              </h2>
              <div className="space-y-4">
                {adapterConfig.fields.map((field) => {
                  if (field.type === 'select') {
                    return (
                      <Select
                        key={field.key}
                        label={field.label}
                        value={(formData.config?.[field.key] as string) || ''}
                        onChange={(e) =>
                          handleConfigChange(field.key, e.target.value)
                        }
                        options={[
                          { value: '', label: `Select ${field.label}` },
                          ...(field.options || []),
                        ]}
                        helper={field.helpText}
                      />
                    );
                  }

                  if (field.type === 'checkbox') {
                    return (
                      <label
                        key={field.key}
                        className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            (formData.config?.[field.key] as boolean) || false
                          }
                          onChange={(e) =>
                            handleConfigChange(field.key, e.target.checked)
                          }
                          className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                          <span className="font-medium text-neutral-900">
                            {field.label}
                          </span>
                          {field.helpText && (
                            <p className="text-sm text-neutral-500">
                              {field.helpText}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  }

                  return (
                    <Input
                      key={field.key}
                      label={field.label}
                      type={field.type}
                      value={(formData.config?.[field.key] as string) || ''}
                      onChange={(e) =>
                        handleConfigChange(field.key, e.target.value)
                      }
                      placeholder={field.placeholder}
                      helper={field.helpText}
                      required={field.required}
                    />
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {(() => {
                  const Icon = adapterIcons[selectedAdapter!];
                  return (
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary-600" />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="font-semibold text-neutral-900">
                    {adapterConfig.label}
                  </h3>
                  <p className="text-sm text-neutral-500">
                    {adapterConfig.description}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full mb-3"
                onClick={() => setStep('select')}
              >
                Change Adapter Type
              </Button>
            </Card>

            {/* Test Result */}
            {testResult && (
              <Card
                className={`p-4 ${
                  testResult.success
                    ? 'bg-success-50 border-success-200'
                    : 'bg-error-50 border-error-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {testResult.success ? (
                    <CheckCircleIcon className="w-5 h-5 text-success-600 mt-0.5" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 text-error-600 mt-0.5" />
                  )}
                  <div>
                    <p
                      className={`font-medium ${
                        testResult.success
                          ? 'text-success-900'
                          : 'text-error-900'
                      }`}
                    >
                      {testResult.success
                        ? 'Connection Successful'
                        : 'Connection Failed'}
                    </p>
                    <p
                      className={`text-sm ${
                        testResult.success
                          ? 'text-success-700'
                          : 'text-error-700'
                      }`}
                    >
                      {testResult.message}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleTestConnection}
                  isLoading={isTesting}
                >
                  Test Connection
                </Button>
                <Button
                  className="w-full"
                  onClick={handleCreate}
                  isLoading={createMutation.isPending}
                  disabled={!formData.branch_id}
                >
                  Create Integration
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Step 3: Test & Create */}
      {step === 'test' && (
        <Card className="p-8">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-success-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Connection Verified!
            </h2>
            <p className="text-neutral-500 mb-6">
              Your integration is ready to be created. The system will start
              syncing stock data automatically based on your configured interval.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" onClick={() => setStep('configure')}>
                Back to Configure
              </Button>
              <Button
                onClick={handleCreate}
                isLoading={createMutation.isPending}
              >
                Create Integration
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
