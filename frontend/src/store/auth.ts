import { create } from 'zustand'
import { api, registerLogoutHandler } from '@/lib/api'
import { setAccessToken } from '@/lib/authToken'

export interface AuthUser {
  id: string
  name: string
  email: string
  role:
    | 'ADMIN'
    | 'MANAGER'
    | 'RECEPTIONIST'
    | 'HOUSEKEEPING'
    | 'CONCIERGE'
    | 'CHEF'
    | 'SECURITY'
    | 'CUSTOMER'
  department?: string | null
  avatar?: string | null
  emailVerified: boolean
  guestId?: string | null
}

interface AuthState {
  user: AuthUser | null
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated'
  login: (email: string, password: string) => Promise<AuthUser>
  register: (input: {
    name: string
    email: string
    password: string
    phone?: string
    nationality?: string
  }) => Promise<{ message: string; email: string }>
  logout: () => Promise<void>
  bootstrap: () => Promise<void>
  setUser: (user: AuthUser) => void
}

const STAFF = ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING', 'CONCIERGE', 'CHEF', 'SECURITY']
export const isStaff = (u: AuthUser | null) => !!u && STAFF.includes(u.role)

export const useAuth = create<AuthState>((set) => ({
  user: null,
  status: 'idle',

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { accessToken, user } = res.data.data
    setAccessToken(accessToken)
    set({ user, status: 'authenticated' })
    return user
  },

  register: async (input) => {
    const res = await api.post('/auth/register', input)
    return res.data.data
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      /* ignore */
    }
    setAccessToken(null)
    set({ user: null, status: 'unauthenticated' })
  },

  setUser: (user) => set({ user }),

  bootstrap: async () => {
    set({ status: 'loading' })
    try {
      const res = await api.post('/auth/refresh')
      const { accessToken, user } = res.data.data
      setAccessToken(accessToken)
      set({ user, status: 'authenticated' })
    } catch {
      setAccessToken(null)
      set({ user: null, status: 'unauthenticated' })
    }
  },
}))

// When the api client gives up on refreshing, reflect that in the store.
registerLogoutHandler(() => useAuth.setState({ user: null, status: 'unauthenticated' }))
