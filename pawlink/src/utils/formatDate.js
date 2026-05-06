/**
 * utils/formatDate.js — Date formatting helpers
 */

/**
 * Format a date string to a readable format
 * e.g., "2024-05-06T12:00:00Z" → "May 6, 2024"
 */
export function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Time ago helper
 * e.g., "3 hours ago", "2 days ago"
 */
export function timeAgo(dateStr) {
  const now      = new Date()
  const past     = new Date(dateStr)
  const diffSecs = Math.floor((now - past) / 1000)

  if (diffSecs < 60)   return `${diffSecs}s ago`
  if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`
  if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`
  return `${Math.floor(diffSecs / 86400)}d ago`
}
