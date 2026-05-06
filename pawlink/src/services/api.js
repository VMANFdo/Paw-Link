import axios from 'axios'

/**
 * api.js — Axios Base Instance
 *
 * WHY: Instead of writing the full URL in every service file,
 * we create one shared Axios instance with a base URL.
 * The request interceptor automatically attaches the JWT token
 * to every outgoing request so we don't repeat that code.
 *
 * During development, Vite's proxy (vite.config.js) forwards
 * /api/* to http://localhost:5000, so no CORS errors.
 */

const api = axios.create({
  baseURL: '/api',      // Proxied by Vite in dev; full URL in production
  headers: {
    'Content-Type': 'application/json',
  },
})

// REQUEST INTERCEPTOR — Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pawlink_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// RESPONSE INTERCEPTOR — Handle token expiry globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear local storage
      localStorage.removeItem('pawlink_token')
      localStorage.removeItem('pawlink_user')
      // Redirect to login (only if not already there)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
