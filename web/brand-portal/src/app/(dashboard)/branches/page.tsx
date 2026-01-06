'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@shared/stores/authStore';
import { brandsService } from '@shared/services/brands.service';
import { Branch } from '@shared/types';
import Card from '@shared/components/ui/Card';
import Badge from '@shared/components/ui/Badge';
import Spinner from '@shared/components/ui/Spinner';
import {
  BuildingStorefrontIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function BranchesPage() {
  const { user } = useAuthStore();
  const brandId = user?.brand_assignment?.brand_id;

  const { data: brandDetails, isLoading } = useQuery({
    queryKey: ['brand-details', brandId],
    queryFn: () => brandsService.getById(brandId!),
    enabled: !!brandId,
  });

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
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Branches</h1>
        <p className="text-neutral-500 mt-1">
          View and manage your brand locations
        </p>
      </div>

      {/* Branches Grid */}
      {branches.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <BuildingStorefrontIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              No branches found
            </h3>
            <p className="text-neutral-500">
              Contact admin to add branch locations.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
        </div>
      )}
    </div>
  );
}

function BranchCard({ branch }: { branch: Branch }) {
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
