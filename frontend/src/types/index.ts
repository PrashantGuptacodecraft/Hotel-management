// ============================================================
// HOTEL MANAGEMENT SYSTEM — GLOBAL TYPE DEFINITIONS
// ============================================================

// --- AUTH ---
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'receptionist' | 'housekeeping' | 'concierge' | 'chef'
  avatar?: string
  department: string
  isOnline: boolean
  createdAt: string
}

// --- ROOM ---
export type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'reserved' | 'checkout'
export type RoomType = 'standard' | 'deluxe' | 'suite' | 'presidential' | 'penthouse'

export interface Room {
  id: string
  number: string
  floor: number
  type: RoomType
  status: RoomStatus
  basePrice: number
  dynamicPrice: number
  capacity: number
  amenities: string[]
  view: 'city' | 'garden' | 'pool' | 'sea' | 'mountain'
  smartControls: SmartRoomControls
  lastCleaned: string
  currentGuestId?: string
  checkoutTime?: string
}

export interface SmartRoomControls {
  temperature: number
  lighting: number
  curtains: 'open' | 'closed' | 'partial'
  tv: boolean
  dnd: boolean
  makeupRoom: boolean
}

// --- GUEST ---
export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface Guest {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  nationality: string
  passportNumber?: string
  loyaltyTier: LoyaltyTier
  loyaltyPoints: number
  totalStays: number
  totalSpend: number
  preferences: GuestPreferences
  tags: string[]
  sentimentScore: number
  createdAt: string
}

export interface GuestPreferences {
  pillowType: 'soft' | 'firm' | 'memory-foam'
  floorPreference: 'low' | 'mid' | 'high'
  dietaryRestrictions: string[]
  roomTemperature: number
  wakeUpCall: boolean
  newspaper: string
  smokingRoom: boolean
  extraBed: boolean
  specialRequests?: string
}

// --- BOOKING ---
export type BookingStatus = 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' | 'no-show' | 'pending'
export type BookingSource = 'direct' | 'booking.com' | 'expedia' | 'airbnb' | 'phone' | 'walkin'

export interface Booking {
  id: string
  bookingNumber: string
  guestId: string
  guest: Guest
  roomId: string
  room: Room
  checkIn: string
  checkOut: string
  nights: number
  adults: number
  children: number
  status: BookingStatus
  source: BookingSource
  totalAmount: number
  paidAmount: number
  currency: 'USD' | 'EUR' | 'GBP' | 'INR'
  specialRequests?: string
  addons: BookingAddon[]
  createdAt: string
  confirmedAt?: string
  checkedInAt?: string
  checkedOutAt?: string
}

export interface BookingAddon {
  name: string
  price: number
  quantity: number
}

// --- STAFF ---
export type StaffDepartment = 'front-desk' | 'housekeeping' | 'fnb' | 'concierge' | 'maintenance' | 'management' | 'security'

export interface Staff {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  department: StaffDepartment
  role: string
  shift: 'morning' | 'afternoon' | 'night'
  status: 'on-duty' | 'off-duty' | 'break'
  tasksCompleted: number
  tasksTotal: number
  rating: number
  joinDate: string
}

export interface Task {
  id: string
  title: string
  description: string
  assignedTo: string
  staffMember?: Staff
  roomId?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  category: 'housekeeping' | 'maintenance' | 'room-service' | 'concierge' | 'other'
  createdAt: string
  dueAt?: string
  completedAt?: string
}

// --- ANALYTICS ---
export interface RevenueData {
  date: string
  rooms: number
  fnb: number
  spa: number
  events: number
  other: number
  total: number
}

export interface OccupancyData {
  date: string
  occupancyRate: number
  roomsOccupied: number
  roomsAvailable: number
  revpar: number
  adr: number
}

export interface KPIMetrics {
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

// --- RESTAURANT ---
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning'

export interface RestaurantTable {
  id: string
  number: number
  capacity: number
  status: TableStatus
  currentOrderId?: string
  reservedFor?: string
  reservedAt?: string
}

export interface MenuItem {
  id: string
  name: string
  description: string
  category: string
  price: number
  available: boolean
  preparationTime: number
  calories?: number
  tags: string[]
  image?: string
}

export interface Order {
  id: string
  tableId: string
  guestId?: string
  items: OrderItem[]
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid'
  subtotal: number
  tax: number
  total: number
  createdAt: string
  servedAt?: string
}

export interface OrderItem {
  menuItemId: string
  menuItem: MenuItem
  quantity: number
  price: number
  notes?: string
}

// --- EVENTS ---
export interface HotelEvent {
  id: string
  title: string
  description: string
  venueId: string
  hostName: string
  startDate: string
  endDate: string
  guestCount: number
  status: 'tentative' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
  totalValue: number
  includes: string[]
  assignedManager: string
}

// --- NOTIFICATIONS ---
export interface Notification {
  id: string
  type: 'booking' | 'checkin' | 'checkout' | 'maintenance' | 'payment' | 'alert' | 'message'
  title: string
  message: string
  isRead: boolean
  priority: 'low' | 'normal' | 'high'
  createdAt: string
  actionUrl?: string
}

// --- API RESPONSES ---
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ApiError {
  success: false
  error: string
  code: number
}

// --- FILTER / QUERY ---
export interface RoomFilters {
  status?: RoomStatus
  type?: RoomType
  floor?: number
  minPrice?: number
  maxPrice?: number
}

export interface BookingFilters {
  status?: BookingStatus
  source?: BookingSource
  dateFrom?: string
  dateTo?: string
  guestId?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
