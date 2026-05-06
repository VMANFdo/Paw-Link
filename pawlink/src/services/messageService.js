import api from './api'

/** messageService.js — Messaging API calls (REST-based) */

export const messageService = {
  /** Send a message to another user */
  send: (data) => api.post('/messages', data),

  /** Get received messages (inbox) */
  getInbox: () => api.get('/messages/inbox'),

  /** Get sent messages */
  getSent: () => api.get('/messages/sent'),

  /** Get a conversation thread with a specific user */
  getThread: (userId) => api.get(`/messages/${userId}`),
}
