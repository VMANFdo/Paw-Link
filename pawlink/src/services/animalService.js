import api from './api'

/**
 * animalService.js — Animal CRUD API calls
 */

export const animalService = {
  /** Get all animals (with optional query filters) */
  getAll: (params) => api.get('/animals', { params }),

  /** Get a single animal by ID */
  getById: (id) => api.get(`/animals/${id}`),

  /**
   * Create a new animal post (with images)
   * @param {FormData} formData - multipart/form-data with images + fields
   */
  create: (formData) =>
    api.post('/animals', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /** Update an existing animal post */
  update: (id, data) => api.put(`/animals/${id}`, data),

  /** Delete an animal post */
  remove: (id) => api.delete(`/animals/${id}`),

  /** Update only the status field */
  updateStatus: (id, status) =>
    api.patch(`/animals/${id}/status`, { status }),

  /** Get animals posted by the current user */
  getMyAnimals: () => api.get('/animals/my'),

  /** Get unique cities */
  getCities: () => api.get('/animals/cities'),
}
