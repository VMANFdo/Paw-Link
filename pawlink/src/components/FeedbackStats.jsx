import { useState, useEffect } from 'react'
import { contactService } from '../services/contactService'
import Rating from './Rating'

/**
 * FeedbackStats.jsx — Display aggregated feedback and rating statistics
 */
export default function FeedbackStats() {
  const [stats, setStats] = useState(null)
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ratingsRes] = await Promise.all([
          contactService.getFeedbackStats(),
          contactService.getAllRatings(),
        ])
        setStats(statsRes.data.data)
        setRatings(ratingsRes.data.data)
      } catch (err) {
        setError('Failed to load feedback statistics.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 dark:text-red-400 font-medium">{error}</p>
      </div>
    )
  }

  if (!stats) return null

  // Calculate average rating
  const avgRating = stats.avg_rating || 0
  const totalRatings = stats.total_ratings || 0

  return (
    <div className="card p-6 md:p-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Community Feedback
      </h3>

      {/* Average Rating */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 p-4 bg-gray-50 dark:bg-dark-950 rounded-xl">
        <div className="text-center">
          <div className="text-4xl font-black text-gray-900 dark:text-white">{avgRating.toFixed(1)}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">out of 5</div>
        </div>
        <div className="flex flex-col items-center sm:items-start">
          <Rating initialRating={Math.round(avgRating)} readOnly size="md" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Based on {totalRatings} rating{totalRatings !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Rating Distribution */}
      {stats.rating_distribution && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Rating Distribution
          </h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.rating_distribution[star] || 0
              const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-8 text-right text-gray-600 dark:text-gray-400 font-medium">
                    {star}
                  </span>
                  <svg className="w-4 h-4 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-gray-500 dark:text-gray-400 text-xs">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Ratings */}
      {ratings.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Recent Ratings
          </h4>
          <div className="space-y-3">
            {ratings.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-950 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400 flex-shrink-0">
                  {r.user_name ? r.user_name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {r.user_name || 'Anonymous'}
                  </p>
                  <Rating initialRating={r.rating} readOnly size="sm" />
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
