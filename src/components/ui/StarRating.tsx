import { Star } from 'lucide-react';

interface StarRatingProps {
  rating?: number;
  onRatingChange?: (value: number) => void;
  readonly?: boolean;
  size?: number;
}

export default function StarRating({ rating = 0, onRatingChange, readonly = false, size = 20 }: StarRatingProps) {
  const handleClick = (value: number) => {
    if (readonly) return;
    if (typeof onRatingChange === 'function') {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition'} focus:outline-none`}
          aria-label={`Rate ${star} stars`}
        >
          <Star
            className={`${star <= rating ? 'fill-gold text-gold' : 'text-gray-300'} transition-colors`}
            style={{ width: size, height: size }}
          />
        </button>
      ))}
    </div>
  );
}
