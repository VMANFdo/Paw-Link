import { useState, useEffect } from 'react'
import api from '../services/api'

/**
 * useFetch.js — Generic data-fetching hook
 *
 * WHY: Avoids repeating loading/error/data state boilerplate
 * in every component that fetches from the API.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useFetch('/animals')
 *
 * @param {string} url - API endpoint (relative to baseURL)
 * @param {object} [params] - Optional query parameters
 */

export function useFetch(url, params = {}) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get(url, { params })
      setData(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (url) fetchData()
  }, [url])

  return { data, loading, error, refetch: fetchData }
}
