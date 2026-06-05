import api from './api'

/**
 * adminService.js — Admin-only API calls
 */
export const adminService = {
  getStats:         () => api.get('/admin/stats'),
  getUsers:         () => api.get('/admin/users'),
  createUser:       (data) => api.post('/admin/users', data),
  updateUserStatus: (id, data) => api.patch(`/admin/users/${id}/status`, data),
  getAnimals:       () => api.get('/admin/animals'),
  deleteAnimal:     (id) => api.delete(`/admin/animals/${id}`),
  getReports:       () => api.get('/admin/reports'),
  updateReportStatus: (id, data) => api.patch(`/admin/reports/${id}`, data),
  getOrganizations: () => api.get('/admin/organizations'),
  createOrganization: (data) => api.post('/admin/organizations', data),
  updateOrgStatus:  (id, data) => api.patch(`/admin/organizations/${id}`, data),
}
