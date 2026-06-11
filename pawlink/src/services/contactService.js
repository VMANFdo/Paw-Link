import api from './api'

/** contactService.js — Contact & Feedback API calls */

export const contactService = {
  /** Submit feedback or problem report */
  submitFeedback: (data) => api.post('/contact/feedback', data),

  /** Submit a rating (stars) */
  submitRating: (data) => api.post('/contact/rating', data),

  /** Get feedback statistics */
  getFeedbackStats: () => api.get('/contact/stats'),

  /** Get all ratings */
  getAllRatings: () => api.get('/contact/ratings'),
}
