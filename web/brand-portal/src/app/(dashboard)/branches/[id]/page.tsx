'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthStore } from '@shared/stores/authStore';
import { brandsService } from '@shared/services/brands.service';
import { WorkingHours } from '@shared/types';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/Badge';
import { Spinner } from '@shared/components/ui/Spinner';
import {
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  GlobeAltIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const dayLabels: Record<typeof dayNames[number], string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export default function BranchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const branchId = params.id as string;
  const brandId = user?.brand_id;

  const { data: brandDetails, isLoading } = useQuery({
    queryKey: ['brand-details', brandId],
    queryFn: () => brandsService.getBrand(brandId!),
    enabled: !!brandId,
  });

  const branch = brandDetails?.branches?.find((b) => b.id === branchId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="text-center py-12">
        <BuildingStorefrontIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 mb-2">Branch not found</h3>
        <p className="text-neutral-500 mb-4">The branch you&apos;re looking for doesn&apos;t exist.</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const todayName = new Date()
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase() as keyof WorkingHours;

  const todayHours = branch.working_hours?.[todayName];
  const isOpenToday = !!todayHours;

  // Simple check if currently open (rough estimation)
  const isCurrentlyOpen = () => {
    const hours = branch.working_hours?.[todayName];
    if (!hours) return false;
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return currentTime >= hours.open && currentTime <= hours.close;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/branches')}>
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-neutral-900">{branch.name}</h1>
              <Badge variant={branch.is_active ? 'success' : 'neutral'}>
                {branch.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-neutral-500 mt-1">{branch.city}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map / Location Placeholder */}
          <Card>
            <div className="aspect-video bg-neutral-100 relative">
              {branch.location ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary-50">
                  <MapPinIcon className="w-12 h-12 text-primary-400 mb-2" />
                  <p className="text-sm text-primary-600">
                    Lat: {branch.location.latitude}, Long: {branch.location.longitude}
                  </p>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <BuildingStorefrontIcon className="w-12 h-12 text-neutral-300 mb-2" />
                  <p className="text-sm text-neutral-500">No location data available</p>
                </div>
              )}
            </div>
          </Card>

          {/* Working Hours */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ClockIcon className="w-5 h-5 text-neutral-400" />
                <h2 className="text-lg font-semibold text-neutral-900">Working Hours</h2>
              </div>

              {branch.working_hours ? (
                <div className="space-y-3">
                  {dayNames.map((day) => {
                    const hours = branch.working_hours?.[day];
                    const isToday = day === todayName;

                    return (
                      <div
                        key={day}
                        className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                          isToday ? 'bg-primary-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium ${
                              isToday ? 'text-primary-700' : 'text-neutral-700'
                            }`}
                          >
                            {dayLabels[day]}
                          </span>
                          {isToday && (
                            <Badge variant="info" size="sm">
                              Today
                            </Badge>
                          )}
                        </div>
                        <span
                          className={`text-sm ${
                            hours ? 'text-neutral-600' : 'text-neutral-400'
                          }`}
                        >
                          {hours ? `${hours.open} - ${hours.close}` : 'Closed'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClockIcon className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                  <p className="text-neutral-500">Working hours not specified</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Status */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Branch Status</span>
                  <Badge variant={branch.is_active ? 'success' : 'neutral'}>
                    {branch.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Open Today</span>
                  <Badge variant={isOpenToday ? 'success' : 'warning'}>
                    {isOpenToday ? 'Yes' : 'Closed'}
                  </Badge>
                </div>
                {isOpenToday && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Currently</span>
                    <Badge variant={isCurrentlyOpen() ? 'success' : 'warning'}>
                      {isCurrentlyOpen() ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Contact Info */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Contact</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Address</p>
                    <p className="text-sm text-neutral-600 mt-1">{branch.address}</p>
                    <p className="text-sm text-neutral-500">
                      {branch.city}
                      {branch.district && `, ${branch.district}`}
                    </p>
                  </div>
                </div>

                {branch.phone && (
                  <div className="flex items-start gap-3">
                    <PhoneIcon className="w-5 h-5 text-neutral-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-neutral-700">Phone</p>
                      <a
                        href={`tel:${branch.phone}`}
                        className="text-sm text-primary-600 hover:text-primary-700 mt-1 block"
                      >
                        {branch.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {branch.location && (
                  <a
                    href={`https://maps.google.com/?q=${branch.location.latitude},${branch.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="outline" className="w-full justify-start">
                      <GlobeAltIcon className="w-4 h-4 mr-2" />
                      Open in Maps
                    </Button>
                  </a>
                )}

                {branch.phone && (
                  <a href={`tel:${branch.phone}`} className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <PhoneIcon className="w-4 h-4 mr-2" />
                      Call Branch
                    </Button>
                  </a>
                )}

                <Link href="/inventory" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    View Inventory
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
