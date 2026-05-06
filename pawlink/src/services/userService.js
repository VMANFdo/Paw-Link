import api from './api'

/** userService.js — User profile API calls */

export const userService = {
  /** Get a user's public profile */
  getProfile: (id) => api.get(`/users/${id}`),

  /** Update logged-in user's profile */
  updateProfile: (data) => api.put('/users/profile', data),
}
