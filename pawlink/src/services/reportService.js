import api from './api'

/**
 * reportService.js — Handles submission of reports by users
 */
export const reportService = {
  createReport: (data) => api.post('/reports', data)
}
