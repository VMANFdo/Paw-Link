import api from './api'

/**
 * organizationService.js — API calls for shelters and organizations
 */

const organizationService = {
  // Public
  getAllApproved: (params) => api.get('/organizations', { params }),
  getPublicProfile: (id) => api.get(`/organizations/${id}`),

  // Private (Organization Dashboard)
  setupProfile: (formData) => api.post('/organizations/setup', formData),
  getMyProfile: () => api.get('/organizations/me'),
  updateProfile: (data) => api.put('/organizations/me', data),
  getMyStats: () => api.get('/organizations/me/stats'),
  updateCapacity: (currentOccupancy) => api.patch('/organizations/me/capacity', { current_occupancy: currentOccupancy }),

  // Admin
  getPendingOrgs: () => api.get('/admin/organizations'), // Admin route
  updateStatus: (id, data) => api.patch(`/admin/organizations/${id}`, data) // Admin route
}

export default organizationService
