'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MoreHorizontal, Eye, Edit, Trash2, UserX, UserCheck, UserPlus } from 'lucide-react';
import { PageHeader } from '../../../../../shared/components/layouts/PageHeader';
import { Card, CardContent } from '../../../../../shared/components/ui/Card';
import { Button } from '../../../../../shared/components/ui/Button';
import { Input } from '../../../../../shared/components/ui/Input';
import { Select, SelectOption } from '../../../../../shared/components/ui/Select';
import { StatusBadge, Badge } from '../../../../../shared/components/ui/Badge';
import { Avatar } from '../../../../../shared/components/ui/Avatar';
import { Pagination, PaginationInfo } from '../../../../../shared/components/ui/Pagination';
import { Spinner } from '../../../../../shared/components/ui/Spinner';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from '../../../../../shared/components/ui/Dropdown';
import { Modal, ConfirmModal } from '../../../../../shared/components/ui/Modal';
import { usersService, CreateUserData } from '../../../../../shared/services/users.service';
import { brandsService } from '../../../../../shared/services/brands.service';
import { formatDate } from '../../../../../shared/lib/utils';
import { toast } from '../../../../../shared/stores/uiStore';
import { useAuthStore } from '../../../../../shared/stores/authStore';
import { User, UserRole, Brand } from '../../../../../shared/types';

const roleOptions: SelectOption[] = [
  { value: '', label: 'All Roles' },
  { value: 'client', label: 'Client' },
  { value: 'brand_manager', label: 'Brand Manager' },
  { value: 'admin', label: 'Admin' },
  { value: 'root_admin', label: 'Root Admin' },
];

const statusOptions: SelectOption[] = [
  { value: '', label: 'All Status' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

const roleColors: Record<UserRole, 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple'> = {
  client: 'default',
  brand_manager: 'info',
  admin: 'purple',
  root_admin: 'error',
};

const createRoleOptions: SelectOption[] = [
  { value: 'client', label: 'Client' },
  { value: 'brand_manager', label: 'Brand Manager' },
  { value: 'admin', label: 'Admin' },
  { value: 'root_admin', label: 'Root Admin' },
];

const initialFormData: CreateUserData = {
  email: '',
  password: '',
  full_name: '',
  phone: '',
  role: 'client',
  brand_id: undefined,
};

export default function UsersPage() {
  const { isRootAdmin } = useAuthStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  });

  // Create user modal state
  const [createModal, setCreateModal] = useState(false);
  const [formData, setFormData] = useState<CreateUserData>(initialFormData);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch brands for brand manager selection
  const { data: brandsData } = useQuery({
    queryKey: ['brands-for-select'],
    queryFn: () => brandsService.getBrands({ limit: 100, is_active: true }),
    enabled: createModal && formData.role === 'brand_manager',
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['users', page, search, roleFilter, statusFilter],
    queryFn: () =>
      usersService.getUsers({
        page,
        limit: 20,
        search: search || undefined,
        role: roleFilter as UserRole || undefined,
        is_active: statusFilter ? statusFilter === 'true' : undefined,
      }),
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleToggleStatus = async (user: User) => {
    try {
      if (user.is_active) {
        await usersService.deactivateUser(user.id);
        toast.success('User deactivated');
      } else {
        await usersService.activateUser(user.id);
        toast.success('User activated');
      }
      refetch();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.user) return;

    try {
      await usersService.deleteUser(deleteModal.user.id);
      toast.success('User deleted');
      setDeleteModal({ open: false, user: null });
      refetch();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.password || !formData.full_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.role === 'brand_manager' && !formData.brand_id) {
      toast.error('Please select a brand for the brand manager');
      return;
    }

    setIsCreating(true);
    try {
      await usersService.createUser(formData);
      toast.success('User created successfully');
      setCreateModal(false);
      setFormData(initialFormData);
      refetch();
    } catch (error: unknown) {
      const err = error as { error?: string };
      toast.error('Failed to create user', err.error || 'Please try again');
    } finally {
      setIsCreating(false);
    }
  };

  const openCreateModal = () => {
    setFormData(initialFormData);
    setCreateModal(true);
  };

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage user accounts and permissions"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Users' },
        ]}
        actions={
          <Button onClick={openCreateModal} leftIcon={<UserPlus className="h-4 w-4" />}>
            Create User
          </Button>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name or email..."
                leftIcon={<Search className="h-4 w-4" />}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Select
                options={roleOptions}
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="w-40"
              />
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-32"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-border-primary bg-background-secondary">
                      <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        User
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Role
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Joined
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-border-subtle hover:bg-background-secondary"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={user.avatar_url}
                              name={user.full_name}
                              size="md"
                            />
                            <div>
                              <p className="text-sm font-medium text-text-primary">
                                {user.full_name}
                              </p>
                              <p className="text-xs text-text-muted">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={roleColors[user.role]}>
                            {user.role.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            status={user.is_active ? 'active' : 'inactive'}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {user.phone || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-tertiary">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <Dropdown>
                            <DropdownTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownContent align="end">
                              <DropdownItem
                                onClick={() => {
                                  window.location.href = `/users/${user.id}`;
                                }}
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownItem>
                              {isRootAdmin() && (
                                <DropdownItem
                                  onClick={() => {
                                    window.location.href = `/users/${user.id}/edit`;
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit Role
                                </DropdownItem>
                              )}
                              <DropdownSeparator />
                              <DropdownItem
                                onClick={() => handleToggleStatus(user)}
                              >
                                {user.is_active ? (
                                  <>
                                    <UserX className="h-4 w-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </DropdownItem>
                              {isRootAdmin() && (
                                <DropdownItem
                                  onClick={() =>
                                    setDeleteModal({ open: true, user })
                                  }
                                  danger
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </DropdownItem>
                              )}
                            </DropdownContent>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.pagination && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border-primary">
                  <PaginationInfo
                    currentPage={data.pagination.page}
                    pageSize={data.pagination.limit}
                    totalItems={data.pagination.total}
                  />
                  <Pagination
                    currentPage={data.pagination.page}
                    totalPages={data.pagination.totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-muted">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, user: null })}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteModal.user?.full_name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Create User Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Create New User"
        size="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Full Name <span className="text-status-error">*</span>
            </label>
            <Input
              placeholder="Enter full name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Email <span className="text-status-error">*</span>
            </label>
            <Input
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Password <span className="text-status-error">*</span>
            </label>
            <Input
              type="password"
              placeholder="Enter password (min 6 characters)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Phone
            </label>
            <Input
              type="tel"
              placeholder="Enter phone number"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Role <span className="text-status-error">*</span>
            </label>
            <Select
              options={createRoleOptions}
              value={formData.role}
              onChange={(e) => setFormData({
                ...formData,
                role: e.target.value as UserRole,
                brand_id: undefined // Reset brand when role changes
              })}
            />
          </div>

          {formData.role === 'brand_manager' && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Assign to Brand <span className="text-status-error">*</span>
              </label>
              <Select
                options={[
                  { value: '', label: 'Select a brand...' },
                  ...(brandsData?.data || []).map((brand) => ({
                    value: brand.id,
                    label: brand.name,
                  })),
                ]}
                value={formData.brand_id || ''}
                onChange={(e) => setFormData({ ...formData, brand_id: e.target.value || undefined })}
              />
              <p className="text-xs text-text-muted mt-1">
                Brand managers can only manage products and orders for their assigned brand.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border-primary">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateModal(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
