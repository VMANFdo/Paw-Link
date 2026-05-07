import api from './api'

/** shelterService.js — Shelter/Organization API calls */

export const shelterService = {
  /** Get current user's shelter profile */
  getMe: () => api.get('/shelters/me'),

  /** Update shelter profile */
  updateMe: (data) => api.put('/shelters/me', data),

  /** Get animals managed by this shelter */
  getAnimals: () => api.get('/shelters/animals'),
}
