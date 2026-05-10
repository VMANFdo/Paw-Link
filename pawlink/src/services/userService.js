import api from './api'

/** userService.js — User profile API calls */

export const userService = {
  /** Get the logged-in user's profile */
  getMyProfile: () => api.get('/users/profile'),

  /** Get a user's public profile */
  getProfile: (id) => api.get(`/users/${id}`),

  /** Update logged-in user's profile */
  updateProfile: (data) => api.put('/users/profile', data),

  /** Get dashboard statistics for the logged-in user */
  getStats: () => api.get('/users/stats'),
}
