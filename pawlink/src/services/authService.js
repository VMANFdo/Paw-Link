import api from './api'

/**
 * authService.js — Authentication API calls
 *
 * WHY: We separate API logic from UI components.
 * Components just call these functions — they don't need
 * to know about Axios, endpoints, or headers.
 */

export const authService = {
  /**
   * Register a new user
   * @param {object} data - { name, email, password, role }
   */
  register: (data) => api.post('/auth/register', data),

  /**
   * Login an existing user
   * @param {object} data - { email, password }
   * @returns { token, user }
   */
  login: (data) => api.post('/auth/login', data),

  /**
   * Get the currently authenticated user's profile
   * (requires JWT token in header — handled by api.js interceptor)
   */
  getMe: () => api.get('/auth/me'),

  /**
   * Submit an appeal message if banned
   */
  submitAppeal: (formData) => api.post('/auth/appeal', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}
