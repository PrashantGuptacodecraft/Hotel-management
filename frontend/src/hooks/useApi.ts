import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

// Generic unwrap of the { success, data } envelope.
async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await api.get(url, { params })
  return res.data.data as T
}

// ---------------- Dashboard / Analytics ----------------
export interface DashboardData {
  kpis: {
    revenueToday: number
    revenueGrowth: number
    occupancyRate: number
    occupancyGrowth: number
    activeGuests: number
    pendingTasks: number
    revpar: number
    adr: number
    goppar: number
    avgStayLength: number
    guestSatisfaction: number
  }
  revenue30d: { date: string; rooms: number; fnb: number; spa: number; events: number; other: number; total: number }[]
  sparklines: { revenue: { v: number }[]; occupancy: { v: number }[]; guests: { v: number }[]; tasks: { v: number }[] }
  statusCounts: Record<string, number>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arrivals: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  departures: any[]
}

export const useDashboard = () =>
  useQuery({ queryKey: ['dashboard'], queryFn: () => get<DashboardData>('/analytics/dashboard'), refetchInterval: 30_000 })

export const useAnalyticsOverview = () =>
  useQuery({ queryKey: ['analytics-overview'], queryFn: () => get('/analytics/overview') })

// ---------------- Rooms ----------------
export interface Room {
  id: string
  number: string
  floor: number
  type: string
  status: string
  basePrice: number
  dynamicPrice: number
  capacity: number
  amenities: string[]
  view: string
  description?: string | null
  images: string[]
}

export const useRooms = (filters?: { status?: string; type?: string; floor?: number }) =>
  useQuery({ queryKey: ['rooms', filters], queryFn: () => get<Room[]>('/rooms', filters) })

export const useAvailableRooms = (params: { checkIn: string; checkOut: string; type?: string; capacity?: number } | null) =>
  useQuery({
    queryKey: ['rooms-available', params],
    queryFn: () => get<Room[]>('/rooms/available', params!),
    enabled: !!params,
  })

export const useRoom = (id: string | null) =>
  useQuery({ queryKey: ['room', id], queryFn: () => get<Room>(`/rooms/${id}`), enabled: !!id })

export const useUpdateRoom = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      api.patch(`/rooms/${id}`, data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rooms'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

// ---------------- Bookings ----------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Booking = any

export const useBookings = (filters?: { status?: string; source?: string; page?: number; limit?: number }) =>
  useQuery({ queryKey: ['bookings', filters], queryFn: () => get<Booking[]>('/bookings', filters) })

export const useMyBookings = () =>
  useQuery({ queryKey: ['my-bookings'], queryFn: () => get<Booking[]>('/bookings/mine') })

export const useCreateCustomerBooking = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/bookings/book', payload).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
      qc.invalidateQueries({ queryKey: ['rooms-available'] })
    },
  })
}

export const useUpdateBookingStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/bookings/${id}/status`, { status }).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export const useCancelBooking = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/bookings/${id}/cancel`).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-bookings'] }),
  })
}

// ---------------- Guests ----------------
export const useGuests = (search?: string) =>
  useQuery({ queryKey: ['guests', search], queryFn: () => get<Booking[]>('/guests', search ? { search } : undefined) })

export const useGuest = (id: string | null) =>
  useQuery({ queryKey: ['guest', id], queryFn: () => get(`/guests/${id}`), enabled: !!id })

export const useMyProfile = () =>
  useQuery({ queryKey: ['my-profile'], queryFn: () => get('/guests/me/profile') })

// ---------------- Staff ----------------
export const useStaff = (filters?: { department?: string; role?: string }) =>
  useQuery({ queryKey: ['staff', filters], queryFn: () => get<Booking[]>('/users', filters) })

export const useCreateStaff = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/users', payload).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
  })
}

export const useUpdateStaff = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      api.patch(`/users/${id}`, data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
  })
}

export const useDeleteStaff = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
  })
}

// ---------------- Account / System ----------------
export const useUpdateProfile = () =>
  useMutation({
    mutationFn: (name: string) => api.patch('/auth/profile', { name }).then((r) => r.data.data.user),
  })

export const useChangePassword = () =>
  useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      api.post('/auth/change-password', payload).then((r) => r.data.data),
  })

export const useSystemStatus = () =>
  useQuery({ queryKey: ['system-status'], queryFn: () => get('/system/status') })

// ---------------- Tasks ----------------
export const useTasks = (filters?: { status?: string; category?: string }) =>
  useQuery({ queryKey: ['tasks', filters], queryFn: () => get<Booking[]>('/tasks', filters) })

export const useUpdateTask = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      api.patch(`/tasks/${id}`, data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

// ---------------- Notifications ----------------
export const useNotifications = () =>
  useQuery({ queryKey: ['notifications'], queryFn: () => get<Booking[]>('/notifications'), refetchInterval: 30_000 })

// ---------------- Concierge (Gemini) ----------------
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export const useConciergeStatus = () =>
  useQuery({ queryKey: ['concierge-status'], queryFn: () => get<{ enabled: boolean }>('/concierge/status') })

export const useConciergeChat = () =>
  useMutation({
    mutationFn: (messages: ChatMessage[]) =>
      api.post('/concierge/chat', { messages }).then((r) => r.data.data as { reply: string }),
  })

// ---------------- Restaurant ----------------
export const useTables = () =>
  useQuery({ queryKey: ['tables'], queryFn: () => get<Booking[]>('/restaurant/tables'), refetchInterval: 20_000 })

export const useMenu = () => useQuery({ queryKey: ['menu'], queryFn: () => get<Booking[]>('/restaurant/menu') })

export const useOrders = () =>
  useQuery({ queryKey: ['orders'], queryFn: () => get<Booking[]>('/restaurant/orders'), refetchInterval: 15_000 })

export const useUpdateTable = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      api.patch(`/restaurant/tables/${id}`, data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  })
}

export const useUpdateMenuItem = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      api.patch(`/restaurant/menu/${id}`, data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu'] }),
  })
}

export const useCreateOrder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.post('/restaurant/orders', payload).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/restaurant/orders/${id}/status`, { status }).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}

// ---------------- Events ----------------
export const useEvents = () =>
  useQuery({ queryKey: ['events'], queryFn: () => get<Booking[]>('/events') })

export const useVenues = () =>
  useQuery({ queryKey: ['venues'], queryFn: () => get<Booking[]>('/events/venues') })

export const useCreateEvent = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/events', payload).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}

export const useUpdateEvent = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      api.patch(`/events/${id}`, data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}
