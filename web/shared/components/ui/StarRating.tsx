'use client';

import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  className,
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const isFilled = index < fullStars;
        const isHalf = index === fullStars && hasHalfStar;

        return (
          <span key={index} className="relative">
            {isFilled || isHalf ? (
              <StarIcon className={cn(sizeClasses[size], 'text-yellow-400')} />
            ) : (
              <StarOutlineIcon className={cn(sizeClasses[size], 'text-neutral-300')} />
            )}
          </span>
        );
      })}
      {showValue && (
        <span className="ml-1 text-sm text-neutral-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
