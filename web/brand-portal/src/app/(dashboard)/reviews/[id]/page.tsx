'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsService } from '@shared/services/reviews.service';
import { toast } from '@shared/stores/uiStore';
import { formatDate } from '@shared/lib/utils';
import { PageHeader } from '@shared/components/layouts/PageHeader';
import { Button } from '@shared/components/ui/Button';
import { Card } from '@shared/components/ui/Card';
import { Badge } from '@shared/components/ui/Badge';
import { Spinner } from '@shared/components/ui/Spinner';
import {
  ArrowLeftIcon,
  StarIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  ShoppingBagIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const reviewId = params.id as string;

  const [responseText, setResponseText] = useState('');

  const { data: review, isLoading } = useQuery({
    queryKey: ['review', reviewId],
    queryFn: () => reviewsService.getById(reviewId),
    enabled: !!reviewId,
  });

  const respondMutation = useMutation({
    mutationFn: (text: string) => reviewsService.respond(reviewId, { text }),
    onSuccess: () => {
      toast.success('Response submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['review', reviewId] });
      setResponseText('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit response');
    },
  });

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (responseText.trim()) {
      respondMutation.mutate(responseText.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">Review not found</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= rating ? (
            <StarIconSolid key={star} className="w-5 h-5 text-warning-500" />
          ) : (
            <StarIcon key={star} className="w-5 h-5 text-neutral-300" />
          )
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Details"
        breadcrumbs={[
          { label: 'Reviews', href: '/reviews' },
          { label: `Review #${reviewId.slice(0, 8)}` },
        ]}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Review Card */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {renderStars(review.rating)}
                <span className="text-lg font-semibold text-neutral-900">
                  {review.rating}/5
                </span>
              </div>
              <div className="flex items-center gap-2">
                {review.is_verified_purchase && (
                  <Badge variant="success" size="sm">
                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                    Verified Purchase
                  </Badge>
                )}
                <Badge variant={review.is_approved ? 'success' : 'warning'} size="sm">
                  {review.is_approved ? 'Approved' : 'Pending'}
                </Badge>
              </div>
            </div>

            {review.title && (
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {review.title}
              </h3>
            )}

            {review.comment && (
              <p className="text-neutral-600 whitespace-pre-wrap">
                {review.comment}
              </p>
            )}

            {/* Review Images */}
            {review.images && review.images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-neutral-700 mb-2">
                  Customer Photos
                </p>
                <div className="flex flex-wrap gap-3">
                  {review.images.map((image, idx) => (
                    <a
                      key={idx}
                      href={image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-20 h-20 rounded-lg overflow-hidden border border-neutral-200 hover:border-primary-500 transition-colors"
                    >
                      <img
                        src={image}
                        alt={`Review image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-neutral-200">
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <CalendarIcon className="w-4 h-4" />
                Submitted on {formatDate(review.created_at)}
              </div>
            </div>
          </Card>

          {/* Response Section */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-neutral-500" />
              <h3 className="font-semibold text-neutral-900">Brand Response</h3>
            </div>

            {review.response ? (
              <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                <p className="text-neutral-700 whitespace-pre-wrap">
                  {review.response.text}
                </p>
                <p className="text-sm text-neutral-500 mt-3">
                  Responded on {formatDate(review.response.responded_at)}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitResponse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Write a response
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Thank the customer or address their feedback..."
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    rows={4}
                    required
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Your response will be visible to the customer and other shoppers
                  </p>
                </div>
                <Button type="submit" isLoading={respondMutation.isPending}>
                  Submit Response
                </Button>
              </form>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <UserCircleIcon className="w-5 h-5 text-neutral-500" />
              <h3 className="font-semibold text-neutral-900">Customer</h3>
            </div>
            {review.user ? (
              <div className="flex items-center gap-3">
                {review.user.avatar_url ? (
                  <img
                    src={review.user.avatar_url}
                    alt={review.user.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center">
                    <UserCircleIcon className="w-6 h-6 text-neutral-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-neutral-900">
                    {review.user.full_name}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-neutral-500">Anonymous</p>
            )}
          </Card>

          {/* Product Info */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBagIcon className="w-5 h-5 text-neutral-500" />
              <h3 className="font-semibold text-neutral-900">Product</h3>
            </div>
            {review.product ? (
              <div className="flex items-start gap-3">
                {review.product.image_url ? (
                  <img
                    src={review.product.image_url}
                    alt={review.product.name}
                    className="w-16 h-16 rounded-lg object-cover border border-neutral-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <ShoppingBagIcon className="w-6 h-6 text-neutral-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-neutral-900">
                    {review.product.name}
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => router.push(`/products/${review.product_id}`)}
                    className="p-0 h-auto mt-1"
                  >
                    View Product
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-neutral-500">Product not found</p>
            )}
          </Card>

          {/* Quick Stats */}
          <Card className="p-6">
            <h3 className="font-semibold text-neutral-900 mb-4">Review Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Approval</span>
                <Badge variant={review.is_approved ? 'success' : 'warning'}>
                  {review.is_approved ? 'Approved' : 'Pending'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Verified</span>
                <Badge variant={review.is_verified_purchase ? 'success' : 'neutral'}>
                  {review.is_verified_purchase ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Has Response</span>
                <Badge variant={review.response ? 'success' : 'neutral'}>
                  {review.response ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Has Images</span>
                <Badge variant={review.images?.length ? 'info' : 'neutral'}>
                  {review.images?.length || 0}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
