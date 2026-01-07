'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsService } from '@shared/services/reviews.service';
import { Review, ReviewsQueryParams } from '@shared/types';
import { useUIStore } from '@shared/stores/uiStore';
import { formatCurrency, formatDate } from '@shared/lib/utils';
import { PageHeader } from '@shared/components/layouts/PageHeader';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/Badge';
import { Card } from '@shared/components/ui/Card';
import { Modal } from '@shared/components/ui/Modal';
import { Spinner } from '@shared/components/ui/Spinner';
import { Select } from '@shared/components/ui/Select';
import { Pagination } from '@shared/components/ui/Pagination';
import { Avatar } from '@shared/components/ui/Avatar';
import {
  StarIcon as StarSolid,
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftIcon,
  TrashIcon,
  PhotoIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'true', label: 'Approved' },
  { value: 'false', label: 'Pending' },
];

const ratingOptions = [
  { value: '', label: 'All Ratings' },
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '2', label: '2 Stars' },
  { value: '1', label: '1 Star' },
];

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {star <= rating ? (
            <StarSolid className={`${sizeClass} text-warning-400`} />
          ) : (
            <StarOutline className={`${sizeClass} text-neutral-300`} />
          )}
        </span>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [responseText, setResponseText] = useState('');

  const queryParams: ReviewsQueryParams = {
    page: currentPage,
    limit: 10,
    is_approved: statusFilter ? statusFilter === 'true' : undefined,
    rating: ratingFilter ? parseInt(ratingFilter) : undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', queryParams],
    queryFn: () => reviewsService.getAll(queryParams),
  });

  const { data: stats } = useQuery({
    queryKey: ['reviews', 'stats'],
    queryFn: () => reviewsService.getStats(),
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => reviewsService.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      addToast('Review approved successfully', 'success');
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to approve review', 'error');
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (id: string) => reviewsService.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      addToast('Review rejected', 'success');
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to reject review', 'error');
    },
  });

  // Respond mutation
  const respondMutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      reviewsService.respond(id, { text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      addToast('Response added successfully', 'success');
      setIsResponseModalOpen(false);
      setResponseText('');
      setSelectedReview(null);
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to add response', 'error');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      addToast('Review deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      setSelectedReview(null);
    },
    onError: (error: Error) => {
      addToast(error.message || 'Failed to delete review', 'error');
    },
  });

  const openDetailModal = (review: Review) => {
    setSelectedReview(review);
    setIsDetailModalOpen(true);
  };

  const openResponseModal = (review: Review) => {
    setSelectedReview(review);
    setResponseText(review.response?.text || '');
    setIsResponseModalOpen(true);
  };

  const openDeleteModal = (review: Review) => {
    setSelectedReview(review);
    setIsDeleteModalOpen(true);
  };

  const handleApprove = (review: Review) => {
    approveMutation.mutate(review.id);
  };

  const handleReject = (review: Review) => {
    rejectMutation.mutate(review.id);
  };

  const handleSubmitResponse = () => {
    if (selectedReview && responseText.trim()) {
      respondMutation.mutate({ id: selectedReview.id, text: responseText.trim() });
    }
  };

  const handleDelete = () => {
    if (selectedReview) {
      deleteMutation.mutate(selectedReview.id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        subtitle="Manage product reviews and ratings"
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-neutral-500">Total Reviews</div>
            <div className="text-2xl font-semibold text-neutral-900 mt-1">
              {stats.total}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-neutral-500">Pending Approval</div>
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
          <Card className="p-4">
            <div className="text-sm text-neutral-500">Average Rating</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-semibold text-neutral-900">
                {stats.average_rating?.toFixed(1) || '-'}
              </span>
              <StarSolid className="w-6 h-6 text-warning-400" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="p-4 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={statusOptions}
            className="w-36"
          />

          <Select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={ratingOptions}
            className="w-36"
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
            <ChatBubbleLeftIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              No reviews found
            </h3>
            <p className="text-neutral-500">
              Reviews will appear here when customers leave feedback.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {data.reviews.map((review) => (
              <div key={review.id} className="p-4 hover:bg-neutral-50">
                <div className="flex items-start gap-4">
                  {/* User Info */}
                  <Avatar
                    src={review.user?.avatar_url}
                    name={review.user?.full_name || 'Anonymous'}
                    size="md"
                  />

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-neutral-900">
                            {review.user?.full_name || 'Anonymous'}
                          </span>
                          {review.is_verified_purchase && (
                            <Badge variant="success" size="sm">
                              <ShieldCheckIcon className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-sm text-neutral-500">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={review.is_approved ? 'success' : 'warning'}
                          size="sm"
                        >
                          {review.is_approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </div>
                    </div>

                    {/* Product */}
                    {review.product && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-neutral-500">
                        <span>Product:</span>
                        <span className="text-neutral-900">
                          {review.product.name}
                        </span>
                      </div>
                    )}

                    {/* Review Content */}
                    {review.title && (
                      <h4 className="font-medium text-neutral-900 mt-3">
                        {review.title}
                      </h4>
                    )}
                    {review.comment && (
                      <p className="text-neutral-600 mt-1 line-clamp-2">
                        {review.comment}
                      </p>
                    )}

                    {/* Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex items-center gap-2 mt-3">
                        <PhotoIcon className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm text-neutral-500">
                          {review.images.length} photo(s)
                        </span>
                      </div>
                    )}

                    {/* Response */}
                    {review.response && (
                      <div className="mt-3 p-3 bg-primary-50 rounded-lg">
                        <div className="text-xs text-primary-600 font-medium mb-1">
                          Store Response
                        </div>
                        <p className="text-sm text-neutral-700 line-clamp-2">
                          {review.response.text}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetailModal(review)}
                      >
                        View Details
                      </Button>

                      {!review.is_approved && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApprove(review)}
                            disabled={approveMutation.isPending}
                          >
                            <CheckIcon className="w-4 h-4 mr-1 text-success-600" />
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReject(review)}
                            disabled={rejectMutation.isPending}
                          >
                            <XMarkIcon className="w-4 h-4 mr-1 text-error-600" />
                            Reject
                          </Button>
                        </>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openResponseModal(review)}
                      >
                        <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
                        {review.response ? 'Edit Response' : 'Respond'}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteModal(review)}
                        className="text-error-600 hover:bg-error-50"
                      >
                        <TrashIcon className="w-4 h-4" />
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

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Review Details"
        size="lg"
      >
        {selectedReview && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar
                src={selectedReview.user?.avatar_url}
                name={selectedReview.user?.full_name || 'Anonymous'}
                size="lg"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-900">
                    {selectedReview.user?.full_name || 'Anonymous'}
                  </span>
                  {selectedReview.is_verified_purchase && (
                    <Badge variant="success" size="sm">
                      <ShieldCheckIcon className="w-3 h-3 mr-1" />
                      Verified Purchase
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <StarRating rating={selectedReview.rating} />
                  <span className="text-sm text-neutral-500">
                    {formatDate(selectedReview.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {selectedReview.product && (
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                {selectedReview.product.image_url && (
                  <img
                    src={selectedReview.product.image_url}
                    alt={selectedReview.product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div>
                  <div className="text-xs text-neutral-500">Product</div>
                  <div className="font-medium text-neutral-900">
                    {selectedReview.product.name}
                  </div>
                </div>
              </div>
            )}

            <div>
              {selectedReview.title && (
                <h4 className="font-medium text-neutral-900 text-lg">
                  {selectedReview.title}
                </h4>
              )}
              {selectedReview.comment && (
                <p className="text-neutral-600 mt-2">{selectedReview.comment}</p>
              )}
            </div>

            {selectedReview.images && selectedReview.images.length > 0 && (
              <div>
                <div className="text-sm font-medium text-neutral-700 mb-2">
                  Photos
                </div>
                <div className="flex gap-2 flex-wrap">
                  {selectedReview.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Review photo ${idx + 1}`}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {selectedReview.response && (
              <div className="p-4 bg-primary-50 rounded-lg">
                <div className="text-sm font-medium text-primary-700 mb-2">
                  Store Response
                </div>
                <p className="text-neutral-700">{selectedReview.response.text}</p>
                <div className="text-xs text-neutral-500 mt-2">
                  Responded on {formatDate(selectedReview.response.responded_at)}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="ghost"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close
              </Button>
              {!selectedReview.is_approved && (
                <Button
                  onClick={() => {
                    handleApprove(selectedReview);
                    setIsDetailModalOpen(false);
                  }}
                >
                  <CheckIcon className="w-4 h-4 mr-1" />
                  Approve Review
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Response Modal */}
      <Modal
        isOpen={isResponseModalOpen}
        onClose={() => setIsResponseModalOpen(false)}
        title={selectedReview?.response ? 'Edit Response' : 'Respond to Review'}
        size="md"
      >
        <div className="space-y-4">
          {selectedReview && (
            <div className="p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={selectedReview.rating} size="sm" />
                <span className="text-sm text-neutral-500">
                  by {selectedReview.user?.full_name || 'Anonymous'}
                </span>
              </div>
              <p className="text-sm text-neutral-600 line-clamp-2">
                {selectedReview.comment || selectedReview.title || 'No comment'}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Your Response
            </label>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
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
              {selectedReview?.response ? 'Update Response' : 'Send Response'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Review"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            Are you sure you want to delete this review? This action cannot be
            undone.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              Delete Review
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
