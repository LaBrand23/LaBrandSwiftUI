'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  settingsService,
  GeneralSettings,
  ShippingSettings,
  PaymentSettings,
  NotificationSettings,
} from '@shared/services/settings.service';
import { PaymentMethod } from '@shared/types';
import { useUIStore } from '@shared/stores/uiStore';
import { formatCurrency } from '@shared/lib/utils';
import { PageHeader } from '@shared/components/layouts/PageHeader';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { Card } from '@shared/components/ui/Card';
import { Spinner } from '@shared/components/ui/Spinner';
import { Tabs } from '@shared/components/ui/Tabs';
import {
  Cog6ToothIcon,
  TruckIcon,
  CreditCardIcon,
  BellIcon,
  EnvelopeIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash_on_delivery: 'Cash on Delivery',
  card: 'Credit/Debit Card',
  payme: 'Payme',
  click: 'Click',
};

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Cog6ToothIcon },
    { id: 'shipping', label: 'Shipping', icon: TruckIcon },
    { id: 'payments', label: 'Payments', icon: CreditCardIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Configure your store settings"
      />

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 shrink-0">
          <Card className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'general' && <GeneralSettingsSection />}
          {activeTab === 'shipping' && <ShippingSettingsSection />}
          {activeTab === 'payments' && <PaymentSettingsSection />}
          {activeTab === 'notifications' && <NotificationSettingsSection />}
        </div>
      </div>
    </div>
  );
}

function GeneralSettingsSection() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const [formData, setFormData] = useState<GeneralSettings>({
    app_name: '',
    support_email: '',
    support_phone: '',
    logo_url: '',
    primary_color: '#000000',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['settings', 'general'],
    queryFn: () => settingsService.getGeneral(),
  });

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (settings: Partial<GeneralSettings>) =>
      settingsService.updateGeneral(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'general'] });
      addToast('Settings saved successfully', 'success');
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to save settings', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <Card className="p-6 flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-neutral-900 mb-6">
        General Settings
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Store Name"
          value={formData.app_name}
          onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
          placeholder="LaBrand"
        />

        <Input
          label="Support Email"
          type="email"
          value={formData.support_email}
          onChange={(e) =>
            setFormData({ ...formData, support_email: e.target.value })
          }
          placeholder="support@labrand.uz"
        />

        <Input
          label="Support Phone"
          value={formData.support_phone}
          onChange={(e) =>
            setFormData({ ...formData, support_phone: e.target.value })
          }
          placeholder="+998 71 123 45 67"
        />

        <Input
          label="Logo URL"
          value={formData.logo_url || ''}
          onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
          placeholder="https://..."
        />

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Primary Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={formData.primary_color || '#000000'}
              onChange={(e) =>
                setFormData({ ...formData, primary_color: e.target.value })
              }
              className="w-12 h-12 rounded-lg border border-neutral-200 cursor-pointer"
            />
            <Input
              value={formData.primary_color || '#000000'}
              onChange={(e) =>
                setFormData({ ...formData, primary_color: e.target.value })
              }
              className="w-32"
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button type="submit" isLoading={mutation.isPending}>
            <CheckIcon className="w-5 h-5 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

function ShippingSettingsSection() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const [formData, setFormData] = useState<ShippingSettings>({
    free_shipping_threshold: 0,
    default_shipping_cost: 0,
    shipping_zones: [],
  });

  const [newZone, setNewZone] = useState({ name: '', cities: '', cost: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['settings', 'shipping'],
    queryFn: () => settingsService.getShipping(),
  });

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (settings: Partial<ShippingSettings>) =>
      settingsService.updateShipping(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'shipping'] });
      addToast('Shipping settings saved successfully', 'success');
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to save settings', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const addZone = () => {
    if (newZone.name && newZone.cities && newZone.cost) {
      setFormData({
        ...formData,
        shipping_zones: [
          ...(formData.shipping_zones || []),
          {
            name: newZone.name,
            cities: newZone.cities.split(',').map((c) => c.trim()),
            cost: parseFloat(newZone.cost),
          },
        ],
      });
      setNewZone({ name: '', cities: '', cost: '' });
    }
  };

  const removeZone = (index: number) => {
    setFormData({
      ...formData,
      shipping_zones: formData.shipping_zones?.filter((_, i) => i !== index),
    });
  };

  if (isLoading) {
    return (
      <Card className="p-6 flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-neutral-900 mb-6">
        Shipping Settings
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Default Shipping Cost (UZS)"
          type="number"
          value={formData.default_shipping_cost.toString()}
          onChange={(e) =>
            setFormData({
              ...formData,
              default_shipping_cost: parseFloat(e.target.value) || 0,
            })
          }
          placeholder="25000"
        />

        <Input
          label="Free Shipping Threshold (UZS)"
          type="number"
          value={formData.free_shipping_threshold.toString()}
          onChange={(e) =>
            setFormData({
              ...formData,
              free_shipping_threshold: parseFloat(e.target.value) || 0,
            })
          }
          helper="Orders above this amount qualify for free shipping"
          placeholder="500000"
        />

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Shipping Zones
          </label>

          {formData.shipping_zones && formData.shipping_zones.length > 0 && (
            <div className="space-y-2 mb-4">
              {formData.shipping_zones.map((zone, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-neutral-900">{zone.name}</p>
                    <p className="text-sm text-neutral-500">
                      {zone.cities.join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      {formatCurrency(zone.cost)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeZone(idx)}
                      className="text-error-600 hover:text-error-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-4 gap-3">
            <Input
              placeholder="Zone Name"
              value={newZone.name}
              onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
            />
            <Input
              placeholder="Cities (comma-separated)"
              value={newZone.cities}
              onChange={(e) => setNewZone({ ...newZone, cities: e.target.value })}
              className="col-span-2"
            />
            <div className="flex gap-2">
              <Input
                placeholder="Cost"
                type="number"
                value={newZone.cost}
                onChange={(e) => setNewZone({ ...newZone, cost: e.target.value })}
              />
              <Button type="button" variant="outline" onClick={addZone}>
                Add
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button type="submit" isLoading={mutation.isPending}>
            <CheckIcon className="w-5 h-5 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

function PaymentSettingsSection() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const [formData, setFormData] = useState<PaymentSettings>({
    enabled_methods: ['cash_on_delivery'],
    payme_config: { merchant_id: '', test_mode: true },
    click_config: { merchant_id: '', service_id: '', test_mode: true },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['settings', 'payments'],
    queryFn: () => settingsService.getPayments(),
  });

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (settings: Partial<PaymentSettings>) =>
      settingsService.updatePayments(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'payments'] });
      addToast('Payment settings saved successfully', 'success');
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to save settings', 'error');
    },
  });

  const toggleMethod = (method: PaymentMethod) => {
    const methods = formData.enabled_methods.includes(method)
      ? formData.enabled_methods.filter((m) => m !== method)
      : [...formData.enabled_methods, method];
    setFormData({ ...formData, enabled_methods: methods });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <Card className="p-6 flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </Card>
    );
  }

  const paymentMethods: PaymentMethod[] = [
    'cash_on_delivery',
    'card',
    'payme',
    'click',
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-neutral-900 mb-6">
        Payment Settings
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Enabled Payment Methods
          </label>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <label
                key={method}
                className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100"
              >
                <input
                  type="checkbox"
                  checked={formData.enabled_methods.includes(method)}
                  onChange={() => toggleMethod(method)}
                  className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="font-medium text-neutral-900">
                  {paymentMethodLabels[method]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {formData.enabled_methods.includes('payme') && (
          <div className="p-4 bg-neutral-50 rounded-lg space-y-4">
            <h3 className="font-medium text-neutral-900">Payme Configuration</h3>
            <Input
              label="Merchant ID"
              value={formData.payme_config?.merchant_id || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  payme_config: {
                    ...formData.payme_config!,
                    merchant_id: e.target.value,
                  },
                })
              }
              placeholder="Your Payme Merchant ID"
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.payme_config?.test_mode || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    payme_config: {
                      ...formData.payme_config!,
                      test_mode: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700">Test Mode</span>
            </label>
          </div>
        )}

        {formData.enabled_methods.includes('click') && (
          <div className="p-4 bg-neutral-50 rounded-lg space-y-4">
            <h3 className="font-medium text-neutral-900">Click Configuration</h3>
            <Input
              label="Merchant ID"
              value={formData.click_config?.merchant_id || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  click_config: {
                    ...formData.click_config!,
                    merchant_id: e.target.value,
                  },
                })
              }
              placeholder="Your Click Merchant ID"
            />
            <Input
              label="Service ID"
              value={formData.click_config?.service_id || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  click_config: {
                    ...formData.click_config!,
                    service_id: e.target.value,
                  },
                })
              }
              placeholder="Your Click Service ID"
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.click_config?.test_mode || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    click_config: {
                      ...formData.click_config!,
                      test_mode: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700">Test Mode</span>
            </label>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button type="submit" isLoading={mutation.isPending}>
            <CheckIcon className="w-5 h-5 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

function NotificationSettingsSection() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const [formData, setFormData] = useState<NotificationSettings>({
    email_notifications: {
      new_order: true,
      order_status_change: true,
      low_stock_alert: true,
      new_review: true,
    },
    sms_notifications: {
      enabled: false,
      order_confirmation: false,
      shipping_update: false,
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['settings', 'notifications'],
    queryFn: () => settingsService.getNotifications(),
  });

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (settings: Partial<NotificationSettings>) =>
      settingsService.updateNotifications(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'notifications'] });
      addToast('Notification settings saved successfully', 'success');
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to save settings', 'error');
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: () => settingsService.testEmailNotification(),
    onSuccess: (result) => {
      addToast(result.message || 'Test email sent successfully', 'success');
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to send test email', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <Card className="p-6 flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-neutral-900 mb-6">
        Notification Settings
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-neutral-900 flex items-center gap-2">
              <EnvelopeIcon className="w-5 h-5" />
              Email Notifications
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => testEmailMutation.mutate()}
              isLoading={testEmailMutation.isPending}
            >
              Send Test Email
            </Button>
          </div>
          <div className="space-y-3">
            {Object.entries({
              new_order: 'New Order Notification',
              order_status_change: 'Order Status Change',
              low_stock_alert: 'Low Stock Alert',
              new_review: 'New Review Notification',
            }).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100"
              >
                <span className="text-neutral-700">{label}</span>
                <input
                  type="checkbox"
                  checked={
                    formData.email_notifications[
                      key as keyof typeof formData.email_notifications
                    ]
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email_notifications: {
                        ...formData.email_notifications,
                        [key]: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium text-neutral-900 mb-4">SMS Notifications</h3>

          <label className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100 mb-4">
            <span className="text-neutral-700 font-medium">Enable SMS Notifications</span>
            <input
              type="checkbox"
              checked={formData.sms_notifications?.enabled || false}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sms_notifications: {
                    ...formData.sms_notifications!,
                    enabled: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
          </label>

          {formData.sms_notifications?.enabled && (
            <div className="space-y-3 pl-4 border-l-2 border-neutral-200">
              {Object.entries({
                order_confirmation: 'Order Confirmation',
                shipping_update: 'Shipping Updates',
              }).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100"
                >
                  <span className="text-neutral-700">{label}</span>
                  <input
                    type="checkbox"
                    checked={
                      formData.sms_notifications?.[
                        key as keyof typeof formData.sms_notifications
                      ] as boolean
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sms_notifications: {
                          ...formData.sms_notifications!,
                          [key]: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <Button type="submit" isLoading={mutation.isPending}>
            <CheckIcon className="w-5 h-5 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
}
