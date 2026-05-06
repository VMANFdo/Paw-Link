import api from './api'

/** adoptionService.js — Adoption request API calls */

export const adoptionService = {
  /** Submit a new adoption request */
  create: (data) => api.post('/adoptions', data),

  /** Get the logged-in user's own adoption requests */
  getMine: () => api.get('/adoptions/my'),

  /** Get adoption requests received for MY animal posts */
  getReceived: () => api.get('/adoptions/received'),

  /** Approve or reject a request */
  updateStatus: (id, status) =>
    api.patch(`/adoptions/${id}`, { status }),
}
