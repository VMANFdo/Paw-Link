import api from './api'

/**
 * handoverService.js — API calls for animal handover requests
 */

const handoverService = {
  // User
  createRequest: (data) => api.post('/handovers', data),
  getMyRequests: () => api.get('/handovers/my'),

  // Organization
  getReceivedRequests: () => api.get('/handovers/received'),
  updateStatus: (id, data) => api.patch(`/handovers/${id}/status`, data)
}

export default handoverService
