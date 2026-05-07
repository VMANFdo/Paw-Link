import api from './api'

/**
 * messageService.js — Messaging API calls
 */
export const messageService = {
  getInbox:  () => api.get('/messages/inbox'),
  getSent:   () => api.get('/messages/sent'),
  getThread: (userId) => api.get(`/messages/${userId}`),
  send:      (data) => api.post('/messages', data), // data: { receiver_id, subject, body }
}
