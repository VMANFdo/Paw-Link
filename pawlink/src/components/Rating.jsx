import { useState } from 'react'

/**
 * Rating.jsx — Star-based rating component
 * Props:
 *   initialRating - Starting rating value (0-5)
 *   readOnly - If true, stars are display-only
 *   size - 'sm', 'md', or 'lg'
 *   onChange - Callback with selected rating
 *   showValue - Show numeric value next to stars
 */
export default function Rating({ initialRating = 0, readOnly = false, size = 'md', onChange, showValue = false }) {
  const [rating, setRating] = useState(initialRating)
  const [hovered, setHovered] = useState(0)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  const handleClick = (value) => {
    if (readOnly) return
    setRating(value)
    if (onChange) onChange(value)
  }

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || rating)
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            onClick={() => handleClick(star)}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} transition-transform ${
              !readOnly && 'hover:scale-110'
            } focus:outline-none focus:ring-2 focus:ring-primary-400 rounded`}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          >
            <svg
              className={`${sizeClasses[size]} transition-colors ${
                filled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        )
      })}
      {showValue && (
        <span className="ml-2 text-sm font-bold text-gray-500 dark:text-gray-400">
          {rating > 0 ? `${rating}/5` : 'Not rated'}
        </span>
      )}
    </div>
  )
}
