'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Send, Users, User, Layers } from 'lucide-react';
import { PageHeader } from '../../../../../shared/components/layouts/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../shared/components/ui/Card';
import { Button } from '../../../../../shared/components/ui/Button';
import { Input } from '../../../../../shared/components/ui/Input';
import { Select } from '../../../../../shared/components/ui/Select';
import { toast } from '../../../../../shared/stores/uiStore';
import { notificationsService } from '../../../../../shared/services/notifications.service';

type NotificationTarget = 'all' | 'segment' | 'user';

interface NotificationForm {
  title: string;
  body: string;
  target: NotificationTarget;
  segment: string;
  userIds: string;
}

const targetOptions = [
  { value: 'all', label: 'All Users' },
  { value: 'segment', label: 'User Segment' },
  { value: 'user', label: 'Specific Users' },
];

const segmentOptions = [
  { value: 'active_buyers', label: 'Active Buyers' },
  { value: 'inactive_users', label: 'Inactive Users' },
  { value: 'new_users', label: 'New Users (last 30 days)' },
  { value: 'vip_customers', label: 'VIP Customers' },
];

export default function NotificationsPage() {
  const [form, setForm] = useState<NotificationForm>({
    title: '',
    body: '',
    target: 'all',
    segment: 'active_buyers',
    userIds: '',
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const data: Parameters<typeof notificationsService.sendPushNotification>[0] = {
        title: form.title,
        body: form.body,
        target: form.target,
      };

      if (form.target === 'segment') {
        data.segment = form.segment;
      }

      if (form.target === 'user' && form.userIds) {
        data.user_ids = form.userIds.split(',').map((id) => id.trim());
      }

      return notificationsService.sendPushNotification(data);
    },
    onSuccess: (result) => {
      toast.success('Notification sent', `Sent to ${result.sent_count} users`);
      setForm({
        title: '',
        body: '',
        target: 'all',
        segment: 'active_buyers',
        userIds: '',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to send notification', error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.body) {
      toast.error('Validation error', 'Title and body are required');
      return;
    }
    sendMutation.mutate();
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Send push notifications to users"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Notification Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Push Notification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Title
                </label>
                <Input
                  placeholder="Notification title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Message
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-border-primary rounded-lg bg-background-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring-focus focus:border-transparent"
                  rows={4}
                  placeholder="Notification message"
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Target Audience
                </label>
                <Select
                  value={form.target}
                  onChange={(value) => setForm({ ...form, target: value as NotificationTarget })}
                  options={targetOptions}
                />
              </div>

              {form.target === 'segment' && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    User Segment
                  </label>
                  <Select
                    value={form.segment}
                    onChange={(value) => setForm({ ...form, segment: value })}
                    options={segmentOptions}
                  />
                </div>
              )}

              {form.target === 'user' && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    User IDs (comma-separated)
                  </label>
                  <Input
                    placeholder="user-id-1, user-id-2, user-id-3"
                    value={form.userIds}
                    onChange={(e) => setForm({ ...form, userIds: e.target.value })}
                  />
                  <p className="text-xs text-text-muted mt-1">
                    Enter user IDs separated by commas
                  </p>
                </div>
              )}

              <Button
                type="submit"
                isLoading={sendMutation.isPending}
                leftIcon={<Send className="h-4 w-4" />}
              >
                Send Notification
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-text-tertiary">All Users</p>
                <p className="text-lg font-semibold text-text-primary">
                  Send to all registered users
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Layers className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-text-tertiary">Segments</p>
                <p className="text-lg font-semibold text-text-primary">
                  Target specific user groups
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-text-tertiary">Individual</p>
                <p className="text-lg font-semibold text-text-primary">
                  Send to specific users by ID
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
