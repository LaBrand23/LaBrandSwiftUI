'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ShoppingCart,
  DollarSign,
  Building2,
  Shield,
  UserX,
  UserCheck,
} from 'lucide-react';
import { PageHeader } from '../../../../../../shared/components/layouts/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../shared/components/ui/Card';
import { Button } from '../../../../../../shared/components/ui/Button';
import { Badge, StatusBadge } from '../../../../../../shared/components/ui/Badge';
import { Avatar } from '../../../../../../shared/components/ui/Avatar';
import { Spinner } from '../../../../../../shared/components/ui/Spinner';
import { ConfirmModal } from '../../../../../../shared/components/ui/Modal';
import { usersService } from '../../../../../../shared/services/users.service';
import { formatCurrency, formatDate } from '../../../../../../shared/lib/utils';
import { toast } from '../../../../../../shared/stores/uiStore';
import { useAuthStore } from '../../../../../../shared/stores/authStore';
import { UserRole } from '../../../../../../shared/types';

const roleColors: Record<UserRole, 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple'> = {
  client: 'default',
  brand_manager: 'info',
  admin: 'purple',
  root_admin: 'error',
};

const roleLabels: Record<UserRole, string> = {
  client: 'Client',
  brand_manager: 'Brand Manager',
  admin: 'Admin',
  root_admin: 'Root Admin',
};

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isRootAdmin } = useAuthStore();
  const userId = params.id as string;

  const [deleteModal, setDeleteModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersService.getUser(userId),
    enabled: !!userId,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async () => {
      if (user?.is_active) {
        await usersService.deactivateUser(userId);
      } else {
        await usersService.activateUser(userId);
      }
    },
    onSuccess: () => {
      toast.success(`User ${user?.is_active ? 'deactivated' : 'activated'}`);
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      setStatusModal(false);
    },
    onError: () => {
      toast.error('Failed to update user status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => usersService.deleteUser(userId),
    onSuccess: () => {
      toast.success('User deleted');
      router.push('/users');
    },
    onError: () => {
      toast.error('Failed to delete user');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <UserIcon className="h-12 w-12 text-text-muted mx-auto mb-4" />
        <p className="text-text-secondary mb-4">User not found</p>
        <Button variant="neutral" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={user.full_name}
        description={user.email}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Users', href: '/users' },
          { label: user.full_name },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="neutral" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {isRootAdmin() && (
              <Link href={`/users/${userId}/edit`}>
                <Button variant="neutral">
                  <Edit className="h-4 w-4" />
                  Edit Role
                </Button>
              </Link>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Profile */}
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <Avatar
                  src={user.avatar_url}
                  name={user.full_name}
                  size="xl"
                />
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{user.full_name}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant={roleColors[user.role]}>
                        {roleLabels[user.role]}
                      </Badge>
                      <StatusBadge status={user.is_active ? 'active' : 'inactive'} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-text-muted" />
                      <span className="text-text-secondary">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-text-muted" />
                        <span className="text-text-secondary">{user.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-text-muted" />
                      <span className="text-text-secondary">
                        Joined {formatDate(user.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Brand Assignment (for brand_managers) */}
          {user.role === 'brand_manager' && user.brand_assignment && (
            <Card>
              <CardHeader>
                <CardTitle>Brand Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-background-secondary flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-text-muted" />
                  </div>
                  <div>
                    <Link
                      href={`/brands/${user.brand_assignment.brand_id}`}
                      className="text-lg font-medium hover:underline"
                    >
                      {user.brand_assignment.brand_name || 'Brand'}
                    </Link>
                    {user.brand_assignment.branch_name && (
                      <p className="text-sm text-text-muted">
                        Branch: {user.brand_assignment.branch_name}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Saved Addresses */}
          {user.addresses && user.addresses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Saved Addresses ({user.addresses.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border-subtle">
                  {user.addresses.map((address) => (
                    <div key={address.id} className="flex items-start gap-4 p-4">
                      <div className="w-10 h-10 rounded-full bg-background-secondary flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-text-muted" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{address.label}</span>
                          {address.is_default && (
                            <Badge variant="success">Default</Badge>
                          )}
                        </div>
                        <p className="text-sm text-text-secondary mt-1">
                          {address.full_address}
                        </p>
                        <p className="text-sm text-text-muted">
                          {address.city}
                          {address.district && `, ${address.district}`}
                          {address.postal_code && ` - ${address.postal_code}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          {(user.orders_count !== undefined || user.total_spent !== undefined) && (
            <Card>
              <CardHeader>
                <CardTitle>Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.orders_count !== undefined && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-text-muted">
                      <ShoppingCart className="h-4 w-4" />
                      <span className="text-sm">Orders</span>
                    </div>
                    <span className="font-semibold">{user.orders_count}</span>
                  </div>
                )}
                {user.total_spent !== undefined && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-text-muted">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">Total Spent</span>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(user.total_spent)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Role & Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Role & Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">Role</span>
                  <Badge variant={roleColors[user.role]}>
                    <Shield className="h-3 w-3 mr-1" />
                    {roleLabels[user.role]}
                  </Badge>
                </div>
                <div className="text-xs text-text-tertiary">
                  {user.role === 'client' && 'Can browse products, place orders, and manage their account.'}
                  {user.role === 'brand_manager' && 'Can manage products, inventory, and orders for assigned brand.'}
                  {user.role === 'admin' && 'Can manage users, brands, products, and platform settings.'}
                  {user.role === 'root_admin' && 'Full access to all platform features and settings.'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.role === 'client' && user.orders_count && user.orders_count > 0 && (
                <Link href={`/orders?user_id=${userId}`} className="block">
                  <Button variant="neutral" className="w-full justify-start">
                    <ShoppingCart className="h-4 w-4" />
                    View Orders
                  </Button>
                </Link>
              )}

              <Button
                variant="neutral"
                className="w-full justify-start"
                onClick={() => setStatusModal(true)}
              >
                {user.is_active ? (
                  <>
                    <UserX className="h-4 w-4" />
                    Deactivate User
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    Activate User
                  </>
                )}
              </Button>

              {isRootAdmin() && (
                <Button
                  variant="danger"
                  className="w-full justify-start"
                  onClick={() => setDeleteModal(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete User
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Toggle Modal */}
      <ConfirmModal
        isOpen={statusModal}
        onClose={() => setStatusModal(false)}
        onConfirm={() => toggleStatusMutation.mutate()}
        title={user.is_active ? 'Deactivate User' : 'Activate User'}
        message={
          user.is_active
            ? `Are you sure you want to deactivate ${user.full_name}? They will no longer be able to access the platform.`
            : `Are you sure you want to activate ${user.full_name}? They will be able to access the platform again.`
        }
        confirmText={user.is_active ? 'Deactivate' : 'Activate'}
        variant={user.is_active ? 'danger' : 'info'}
        isLoading={toggleStatusMutation.isPending}
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete User"
        message={`Are you sure you want to delete ${user.full_name}? This action cannot be undone and will remove all their data.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
