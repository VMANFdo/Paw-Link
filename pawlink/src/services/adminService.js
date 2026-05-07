import api from './api'

/**
 * adminService.js — Admin-only API calls
 */
export const adminService = {
  getStats:         () => api.get('/admin/stats'),
  getUsers:         () => api.get('/admin/users'),
  updateUserStatus: (id, isActive) => api.patch(`/admin/users/${id}/status`, { is_active: isActive }),
  getAnimals:       () => api.get('/admin/animals'),
  deleteAnimal:     (id) => api.delete(`/admin/animals/${id}`),
  getReports:       () => api.get('/admin/reports'),
}
