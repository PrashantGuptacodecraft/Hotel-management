import { z } from 'zod'
import { ROOM_STATUSES, ROOM_TYPES } from '../lib/enums'

export const listRoomsQuery = z.object({
  status: z.enum(ROOM_STATUSES).optional(),
  type: z.enum(ROOM_TYPES).optional(),
  floor: z.coerce.number().int().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(500),
})

export const availableRoomsQuery = z.object({
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  type: z.enum(ROOM_TYPES).optional(),
  capacity: z.coerce.number().int().min(1).optional(),
})

export const createRoomSchema = z.object({
  number: z.string().min(1),
  floor: z.number().int().min(1).max(50),
  type: z.enum(ROOM_TYPES),
  basePrice: z.number().positive(),
  dynamicPrice: z.number().positive().optional(),
  capacity: z.number().int().min(1).max(20),
  amenities: z.array(z.string()).default([]),
  view: z.string().min(1),
  description: z.string().optional(),
  images: z.array(z.string()).default([]),
  squareMeters: z.number().positive().optional(),
})

export const updateRoomSchema = z.object({
  status: z.enum(ROOM_STATUSES).optional(),
  type: z.enum(ROOM_TYPES).optional(),
  basePrice: z.number().positive().optional(),
  dynamicPrice: z.number().positive().optional(),
  capacity: z.number().int().min(1).max(20).optional(),
  amenities: z.array(z.string()).optional(),
  description: z.string().optional(),
  temperature: z.number().min(10).max(35).optional(),
  lighting: z.number().int().min(0).max(100).optional(),
})
