'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@shared/stores/authStore';
import { toast } from '@shared/stores/uiStore';
import { reviewsService } from '@shared/services/reviews.service';
import { Review, ReviewsQueryParams } from '@shared/types';
import { formatDate } from '@shared/lib/utils';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/Badge';
import { Spinner } from '@shared/components/ui/Spinner';
import { Modal } from '@shared/components/ui/Modal';
import { Pagination } from '@shared/components/ui/Pagination';
import { Select } from '@shared/components/ui/Select';
import { Avatar } from '@shared/components/ui/Avatar';
import {
  ChatBubbleLeftRightIcon,
  StarIcon as StarSolid,
} from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

const ratingOptions = [
  { value: '', label: 'All Ratings' },
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '2', label: '2 Stars' },
  { value: '1', label: '1 Star' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {star <= rating ? (
            <StarSolid className="w-4 h-4 text-warning-400" />
          ) : (
            <StarOutline className="w-4 h-4 text-neutral-300" />
          )}
        </span>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const brandId = user?.brand_id;

  const [currentPage, setCurrentPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [responseText, setResponseText] = useState('');

  const queryParams: ReviewsQueryParams = {
    brand_id: brandId,
    page: currentPage,
    limit: 10,
    rating: ratingFilter ? parseInt(ratingFilter) : undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', queryParams],
    queryFn: () => reviewsService.getAll(queryParams),
    enabled: !!brandId,
  });

  const { data: stats } = useQuery({
    queryKey: ['reviews', 'stats', brandId],
    queryFn: () => reviewsService.getStats(),
    enabled: !!brandId,
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      reviewsService.respond(id, { text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Response sent successfully');
      setIsResponseModalOpen(false);
      setResponseText('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send response');
    },
  });

  const openResponseModal = (review: Review) => {
    setSelectedReview(review);
    setResponseText(review.response?.text || '');
    setIsResponseModalOpen(true);
  };

  const handleSubmitResponse = () => {
    if (selectedReview && responseText.trim()) {
      respondMutation.mutate({ id: selectedReview.id, text: responseText.trim() });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Reviews</h1>
        <p className="text-neutral-500 mt-1">
          Manage customer feedback and reviews
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-neutral-500">Total Reviews</div>
            <div className="text-2xl font-semibold text-neutral-900 mt-1">
              {stats.total}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-neutral-500">Average Rating</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-semibold text-neutral-900">
                {stats.average_rating?.toFixed(1) || '-'}
              </span>
              <StarSolid className="w-6 h-6 text-warning-400" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-neutral-500">Pending</div>
            <div className="text-2xl font-semibold text-warning-600 mt-1">
              {stats.pending}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-neutral-500">Approved</div>
            <div className="text-2xl font-semibold text-success-600 mt-1">
              {stats.approved}
            </div>
          </Card>
        </div>
      )}

      {/* Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Select
            value={ratingFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setRatingFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={ratingOptions}
            className="w-40"
          />
        </div>
      </Card>

      {/* Reviews List */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : !data?.reviews.length ? (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              No reviews yet
            </h3>
            <p className="text-neutral-500">
              Reviews will appear here when customers leave feedback.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {data.reviews.map((review) => (
              <div key={review.id} className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar
                    src={review.user?.avatar_url}
                    name={review.user?.full_name || 'Anonymous'}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-neutral-900">
                          {review.user?.full_name || 'Anonymous'}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <StarRating rating={review.rating} />
                          <span className="text-sm text-neutral-500">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={review.is_approved ? 'success' : 'warning'}
                        size="sm"
                      >
                        {review.is_approved ? 'Approved' : 'Pending'}
                      </Badge>
                    </div>

                    {review.product && (
                      <p className="text-sm text-neutral-500 mt-2">
                        Product: <span className="text-neutral-900">{review.product.name}</span>
                      </p>
                    )}

                    {review.title && (
                      <h4 className="font-medium text-neutral-900 mt-3">
                        {review.title}
                      </h4>
                    )}
                    {review.comment && (
                      <p className="text-neutral-600 mt-1">{review.comment}</p>
                    )}

                    {review.response && (
                      <div className="mt-3 p-3 bg-primary-50 rounded-lg">
                        <p className="text-xs text-primary-600 font-medium mb-1">
                          Your Response
                        </p>
                        <p className="text-sm text-neutral-700">
                          {review.response.text}
                        </p>
                      </div>
                    )}

                    <div className="mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openResponseModal(review)}
                      >
                        {review.response ? 'Edit Response' : 'Respond'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="p-4 border-t border-neutral-100">
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Response Modal */}
      <Modal
        isOpen={isResponseModalOpen}
        onClose={() => setIsResponseModalOpen(false)}
        title="Respond to Review"
        size="md"
      >
        {selectedReview && (
          <div className="space-y-4">
            <div className="p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={selectedReview.rating} />
                <span className="text-sm text-neutral-500">
                  by {selectedReview.user?.full_name || 'Anonymous'}
                </span>
              </div>
              <p className="text-sm text-neutral-600">
                {selectedReview.comment || selectedReview.title || 'No comment'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Your Response
              </label>
              <textarea
                value={responseText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResponseText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Thank you for your feedback..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="ghost"
                onClick={() => setIsResponseModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitResponse}
                isLoading={respondMutation.isPending}
                disabled={!responseText.trim()}
              >
                Send Response
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
