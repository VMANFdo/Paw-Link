import api from './api'

/** rescueService.js — Rescue request API calls */

export const rescueService = {
  /** Flag an animal as an urgent rescue case */
  create: (data) => api.post('/rescues', data),

  /** Get all active rescue cases */
  getAll: (params) => api.get('/rescues', { params }),

  /** Update rescue status (shelter/admin only) */
  updateStatus: (id, status) =>
    api.patch(`/rescues/${id}/status`, { status }),

  /** Get rescue requests reported by the current user */
  getMyRescues: () => api.get('/rescues/my'),
}
