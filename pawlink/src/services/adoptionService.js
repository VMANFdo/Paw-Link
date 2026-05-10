import api from './api'

/** adoptionService.js — Adoption request API calls */

export const adoptionService = {
  /** Submit a new adoption request */
  create: (data) => api.post('/adoptions', data),

  /** Get the logged-in user's own sent adoption requests */
  getMine: () => api.get('/adoptions/my'),

  /** Get adoption requests received for MY animal posts */
  getReceived: () => api.get('/adoptions/received'),

  /**
   * Check if the logged-in user already has a request for a given animal.
   * Returns { existing: { id, status } | null }
   */
  check: (animalId) => api.get(`/adoptions/check/${animalId}`),

  /** Approve or reject a received request (poster only) */
  updateStatus: (id, status) => api.patch(`/adoptions/${id}`, { status }),

  /** Cancel my own pending adoption request */
  cancel: (id) => api.delete(`/adoptions/${id}`),
}
