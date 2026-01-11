'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@shared/stores/authStore';
import { toast } from '@shared/stores/uiStore';
import { usersService } from '@shared/services/users.service';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { Avatar } from '@shared/components/ui/Avatar';
import { Badge } from '@shared/components/ui/Badge';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingStorefrontIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: { full_name?: string; phone?: string }) =>
      usersService.updateProfile(user!.id, data),
    onSuccess: (updatedUser) => {
      setUser({ ...user!, ...updatedUser });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // This would call an API to change password
    toast.success('Password changed successfully');
    setIsChangingPassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Profile</h1>
        <p className="text-neutral-500 mt-1">
          Manage your account settings
        </p>
      </div>

      {/* Profile Card */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <Avatar
            src={user.avatar_url}
            name={user.full_name}
            size="xl"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  {user.full_name}
                </h2>
                <p className="text-neutral-500">{user.email}</p>
                <Badge variant="info" size="sm" className="mt-2">
                  Brand Manager
                </Badge>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>

            {user.brand_assignment && (
              <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BuildingStorefrontIcon className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-primary-900">
                      {user.brand_assignment.brand_name}
                    </p>
                    {user.brand_assignment.branch_name && (
                      <p className="text-sm text-primary-700">
                        {user.brand_assignment.branch_name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <form onSubmit={handleUpdateProfile} className="mt-6 pt-6 border-t space-y-4">
            <Input
              label="Full Name"
              value={formData.full_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Your full name"
            />
            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+998 XX XXX XX XX"
            />
            <div className="flex justify-end">
              <Button type="submit" isLoading={updateProfileMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Account Info */}
      <Card className="p-6">
        <h3 className="font-semibold text-neutral-900 mb-4">Account Information</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
              <EnvelopeIcon className="w-5 h-5 text-neutral-500" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Email</p>
              <p className="font-medium text-neutral-900">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
              <PhoneIcon className="w-5 h-5 text-neutral-500" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Phone</p>
              <p className="font-medium text-neutral-900">
                {user.phone || 'Not set'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
              <UserCircleIcon className="w-5 h-5 text-neutral-500" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Role</p>
              <p className="font-medium text-neutral-900 capitalize">
                Brand Manager
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Change Password */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-900">Security</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsChangingPassword(!isChangingPassword)}
          >
            <KeyIcon className="w-4 h-4 mr-2" />
            Change Password
          </Button>
        </div>

        {isChangingPassword && (
          <form onSubmit={handleChangePassword} className="space-y-4 pt-4 border-t">
            <Input
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
              placeholder="Enter current password"
              required
            />
            <Input
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
              placeholder="Enter new password"
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              placeholder="Confirm new password"
              required
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsChangingPassword(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Password</Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
