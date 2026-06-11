const pool = require('../config/db')

/**
 * contactService.js — Backend Contact Form Service
 *
 * Handles database operations for contact feedback and ratings.
 */

const contactService = {
  /**
   * Submit feedback
   */
  submitFeedback: async (data) => {
    const { feedback_type, subject, message, priority, category, screenshot_url } = data

    const [result] = await pool.query(
      `INSERT INTO contact_feedback (user_id, feedback_type, subject, message, priority, category, screenshot_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.user_id || null, feedback_type, subject, message, priority || 'medium', category || null, screenshot_url || null]
    )

    return { data: { id: result.insertId, ...data } }
  },

  /**
   * Submit a rating (stars)
   */
  submitRating: async (data) => {
    const { user_id, rating, feedback_id } = data

    const [result] = await pool.query(
      'INSERT INTO contact_ratings (user_id, rating, feedback_id) VALUES (?, ?, ?)',
      [user_id || null, rating, feedback_id || null]
    )

    return { data: { id: result.insertId, ...data } }
  },

  /**
   * Get aggregated feedback statistics
   */
  getFeedbackStats: async () => {
    const [totalFeedback] = await pool.query('SELECT COUNT(*) as total FROM contact_feedback')
    const [ratingStats] = await pool.query(
      'SELECT COUNT(*) as total_ratings, AVG(rating) as avg_rating FROM contact_ratings'
    )
    const [feedbackByType] = await pool.query(
      'SELECT feedback_type, COUNT(*) as count FROM contact_feedback GROUP BY feedback_type'
    )
    const [statusDist] = await pool.query(
      'SELECT status, COUNT(*) as count FROM contact_feedback GROUP BY status'
    )
    const [ratingDist] = await pool.query(
      'SELECT rating, COUNT(*) as count FROM contact_ratings GROUP BY rating'
    )

    const ratingDistribution = {}
    ratingDist.forEach((r) => { ratingDistribution[r.rating] = r.count })

    return {
      data: {
        total_feedback: totalFeedback[0].total,
        total_ratings: ratingStats[0].total_ratings || 0,
        avg_rating: parseFloat(ratingStats[0].avg_rating) || 0,
        feedback_by_type: feedbackByType.reduce((acc, f) => { acc[f.feedback_type] = f.count; return acc }, {}),
        status_distribution: statusDist.reduce((acc, s) => { acc[s.status] = s.count; return acc }, {}),
        rating_distribution: ratingDistribution,
      }
    }
  },

  /**
   * Get all ratings with user names
   */
  getAllRatings: async () => {
    const [ratings] = await pool.query(
      `SELECT cr.id, cr.rating, cr.created_at, u.name as user_name
       FROM contact_ratings cr
       LEFT JOIN users u ON cr.user_id = u.id
       ORDER BY cr.created_at DESC`
    )

    return { data: ratings }
  }
}

module.exports = { contactService }
