import { z } from 'zod'
import { BOOKING_STATUSES, BOOKING_SOURCES } from '../lib/enums'

// Staff creating a booking on behalf of a guest (trusted add-on pricing).
export const createBookingSchema = z.object({
  guestId: z.string().min(1),
  roomId: z.string().min(1),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  adults: z.number().int().min(1).max(20).default(1),
  children: z.number().int().min(0).max(20).default(0),
  source: z.enum(BOOKING_SOURCES).default('DIRECT'),
  specialRequests: z.string().max(500).optional(),
  addons: z
    .array(z.object({ name: z.string(), price: z.number().min(0), quantity: z.number().int().min(1).max(10) }))
    .default([]),
})

// Customer booking for themselves — add-ons are KEYS only (priced server-side).
export const customerBookingSchema = z.object({
  roomId: z.string().min(1),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  adults: z.number().int().min(1).max(20).default(1),
  children: z.number().int().min(0).max(20).default(0),
  specialRequests: z.string().max(500).optional(),
  addons: z.array(z.object({ key: z.string(), quantity: z.number().int().min(1).max(10) })).default([]),
})

export const listBookingsQuery = z.object({
  status: z.enum(BOOKING_STATUSES).optional(),
  source: z.enum(BOOKING_SOURCES).optional(),
  guestId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
})

export const updateStatusSchema = z.object({
  status: z.enum(BOOKING_STATUSES),
})
