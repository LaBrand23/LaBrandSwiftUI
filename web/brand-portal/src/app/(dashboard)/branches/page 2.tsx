'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@shared/stores/authStore';
import { brandsService, CreateBranchData } from '@shared/services/brands.service';
import { Branch } from '@shared/types';
import { Card } from '@shared/components/ui/Card';
import { Badge } from '@shared/components/ui/Badge';
import { Spinner } from '@shared/components/ui/Spinner';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { toast } from 'sonner';
import {
  BuildingStorefrontIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface BranchFormData {
  name: string;
  address: string;
  city: string;
  phone: string;
}

export default function BranchesPage() {
  const { user } = useAuthStore();
  const brandId = user?.brand_id;
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<BranchFormData>({
    name: '',
    address: '',
    city: '',
    phone: '',
  });

  const { data: brandDetails, isLoading } = useQuery({
    queryKey: ['brand-details', brandId],
    queryFn: () => brandsService.getBrand(brandId!),
    enabled: !!brandId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateBranchData) => brandsService.createBranch(brandId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-details', brandId] });
      toast.success('Branch created successfully');
      closeModal();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create branch');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ branchId, data }: { branchId: string; data: Partial<CreateBranchData> }) =>
      brandsService.updateBranch(brandId!, branchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-details', brandId] });
      toast.success('Branch updated successfully');
      closeModal();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update branch');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (branchId: string) => brandsService.deleteBranch(brandId!, branchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-details', brandId] });
      toast.success('Branch deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete branch');
    },
  });

  const openCreateModal = () => {
    setEditingBranch(null);
    setFormData({ name: '', address: '', city: '', phone: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      city: branch.city || '',
      phone: branch.phone || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
    setFormData({ name: '', address: '', city: '', phone: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.address) {
      toast.error('Name and address are required');
      return;
    }

    const data: CreateBranchData = {
      name: formData.name,
      address: formData.address,
      city: formData.city || undefined,
      phone: formData.phone || undefined,
    };

    if (editingBranch) {
      updateMutation.mutate({ branchId: editingBranch.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (branch: Branch) => {
    if (confirm(`Are you sure you want to delete "${branch.name}"?`)) {
      deleteMutation.mutate(branch.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  const branches = brandDetails?.branches || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Branches</h1>
          <p className="text-neutral-500 mt-1">
            View and manage your brand locations
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Branch
        </Button>
      </div>

      {/* Branches Grid */}
      {branches.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <BuildingStorefrontIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              No branches found
            </h3>
            <p className="text-neutral-500 mb-4">
              Add your first branch location to get started.
            </p>
            <Button onClick={openCreateModal}>
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Branch
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              onEdit={() => openEditModal(branch)}
              onDelete={() => handleDelete(branch)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingBranch ? 'Edit Branch' : 'Add New Branch'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-neutral-100 rounded-full"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Branch Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Store"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Address *
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g., 123 Main Street"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  City
                </label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g., Tashkent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Phone
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g., +998 90 123 4567"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : null}
                  {editingBranch ? 'Save Changes' : 'Create Branch'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function BranchCard({
  branch,
  onEdit,
  onDelete,
}: {
  branch: Branch;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const formatWorkingHours = (hours?: Branch['working_hours']) => {
    if (!hours) return 'Not specified';

    const today = new Date()
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase() as keyof typeof hours;
    const todayHours = hours[today];

    if (!todayHours) return 'Closed today';
    return `${todayHours.open} - ${todayHours.close}`;
  };

  return (
    <Card className="overflow-hidden">
      {/* Map placeholder */}
      <div className="h-32 bg-neutral-100 relative">
        {branch.location ? (
          <div className="absolute inset-0 flex items-center justify-center bg-primary-50">
            <MapPinIcon className="w-8 h-8 text-primary-400" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BuildingStorefrontIcon className="w-8 h-8 text-neutral-300" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={branch.is_active ? 'success' : 'neutral'} size="sm">
            {branch.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        {/* Action buttons */}
        <div className="absolute top-2 left-2 flex gap-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              onEdit();
            }}
            className="p-1.5 bg-white rounded-full shadow-sm hover:bg-neutral-50"
            title="Edit branch"
          >
            <PencilIcon className="w-4 h-4 text-neutral-600" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            className="p-1.5 bg-white rounded-full shadow-sm hover:bg-red-50"
            title="Delete branch"
          >
            <TrashIcon className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-neutral-900">{branch.name}</h3>
        <p className="text-sm text-neutral-500">{branch.city}</p>

        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3">
            <MapPinIcon className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
            <p className="text-sm text-neutral-600">{branch.address}</p>
          </div>

          {branch.phone && (
            <div className="flex items-center gap-3">
              <PhoneIcon className="w-5 h-5 text-neutral-400" />
              <a
                href={`tel:${branch.phone}`}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {branch.phone}
              </a>
            </div>
          )}

          <div className="flex items-center gap-3">
            <ClockIcon className="w-5 h-5 text-neutral-400" />
            <p className="text-sm text-neutral-600">
              Today: {formatWorkingHours(branch.working_hours)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
