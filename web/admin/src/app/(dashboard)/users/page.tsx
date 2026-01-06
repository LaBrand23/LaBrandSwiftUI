'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Search, Plus, Filter, MoreHorizontal, Eye, Edit, Trash2, UserX, UserCheck } from 'lucide-react';
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
import { ConfirmModal } from '../../../../../shared/components/ui/Modal';
import { usersService } from '../../../../../shared/services/users.service';
import { formatDate } from '../../../../../shared/lib/utils';
import { toast } from '../../../../../shared/stores/uiStore';
import { useAuthStore } from '../../../../../shared/stores/authStore';
import { User, UserRole } from '../../../../../shared/types';

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

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage user accounts and permissions"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Users' },
        ]}
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
    </>
  );
}
