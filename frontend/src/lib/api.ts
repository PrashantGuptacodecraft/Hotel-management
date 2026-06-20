import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getAccessToken, setAccessToken } from './authToken'

export interface ApiEnvelope<T> {
  success: boolean
  data: T
  pagination?: { total: number; page: number; limit: number; totalPages: number }
  error?: string
}

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send the httpOnly refresh cookie
})

// Attach the access token to every request.
api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ---- Single-flight refresh on 401 ----
let refreshing: Promise<string | null> | null = null
const onLogout: Array<() => void> = []
export const registerLogoutHandler = (fn: () => void) => onLogout.push(fn)

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await axios.post<ApiEnvelope<{ accessToken: string }>>(
      '/api/auth/refresh',
      {},
      { withCredentials: true }
    )
    const token = res.data.data.accessToken
    setAccessToken(token)
    return token
  } catch {
    setAccessToken(null)
    onLogout.forEach((fn) => fn())
    return null
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retried?: boolean }
    const status = error.response?.status
    const url = original?.url ?? ''

    // Don't try to refresh for the auth endpoints themselves.
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/register')

    if (status === 401 && !original._retried && !isAuthCall) {
      original._retried = true
      refreshing = refreshing ?? refreshAccessToken()
      const token = await refreshing
      refreshing = null
      if (token) {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      }
    }
    return Promise.reject(error)
  }
)

/** Extract a friendly error message from an axios error, surfacing field-level details. */
export function apiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string; details?: Record<string, string[]> }
    if (data?.details) {
      const first = Object.values(data.details).flat()[0]
      if (first) return first
    }
    return data?.error ?? err.message
  }
  return err instanceof Error ? err.message : 'Something went wrong'
}
