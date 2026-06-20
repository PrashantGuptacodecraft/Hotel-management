// Central source of truth for the string-enum values stored in SQLite.
// Mirrored by zod validators and the frontend types.

export const USER_ROLES = [
  'ADMIN',
  'MANAGER',
  'RECEPTIONIST',
  'HOUSEKEEPING',
  'CONCIERGE',
  'CHEF',
  'SECURITY',
  'CUSTOMER',
] as const
export type UserRole = (typeof USER_ROLES)[number]

/** Roles that belong to hotel staff (i.e. can reach the management dashboard). */
export const STAFF_ROLES: UserRole[] = [
  'ADMIN',
  'MANAGER',
  'RECEPTIONIST',
  'HOUSEKEEPING',
  'CONCIERGE',
  'CHEF',
  'SECURITY',
]

export const ROOM_STATUSES = [
  'AVAILABLE',
  'OCCUPIED',
  'CLEANING',
  'MAINTENANCE',
  'RESERVED',
  'CHECKOUT',
] as const
export type RoomStatus = (typeof ROOM_STATUSES)[number]

export const ROOM_TYPES = ['STANDARD', 'DELUXE', 'SUITE', 'PRESIDENTIAL', 'PENTHOUSE'] as const
export type RoomType = (typeof ROOM_TYPES)[number]

export const LOYALTY_TIERS = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'] as const
export type LoyaltyTier = (typeof LOYALTY_TIERS)[number]

export const BOOKING_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'CHECKED_IN',
  'CHECKED_OUT',
  'CANCELLED',
  'NO_SHOW',
] as const
export type BookingStatus = (typeof BOOKING_STATUSES)[number]

export const BOOKING_SOURCES = [
  'DIRECT',
  'BOOKING_COM',
  'EXPEDIA',
  'AIRBNB',
  'PHONE',
  'WALKIN',
] as const
export type BookingSource = (typeof BOOKING_SOURCES)[number]

export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

export const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

/** Bookings that actively hold a room (block availability). */
export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ['PENDING', 'CONFIRMED', 'CHECKED_IN']

// --- Restaurant ---
export const TABLE_STATUSES = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING'] as const
export type TableStatus = (typeof TABLE_STATUSES)[number]

export const ORDER_STATUSES = ['PENDING', 'PREPARING', 'READY', 'SERVED', 'PAID', 'CANCELLED'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const MENU_CATEGORIES = ['Starters', 'Soups', 'Mains', 'Desserts', 'Beverages'] as const

// --- Events ---
export const EVENT_STATUSES = ['TENTATIVE', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const
export type EventStatus = (typeof EVENT_STATUSES)[number]
