import { z } from 'zod'

export const listGuestsQuery = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
})

export const createGuestSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().toLowerCase(),
  phone: z.string().min(3).max(30),
  nationality: z.string().min(2).max(60),
  passportNumber: z.string().max(40).optional(),
  tags: z.array(z.string()).default([]),
  isVIP: z.boolean().optional(),
})

export const updateGuestSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().min(3).max(30).optional(),
  nationality: z.string().min(2).max(60).optional(),
  passportNumber: z.string().max(40).optional(),
  tags: z.array(z.string()).optional(),
  isVIP: z.boolean().optional(),
  isBlacklisted: z.boolean().optional(),
})

export const preferencesSchema = z.object({
  pillowType: z.enum(['soft', 'firm', 'memory-foam']).optional(),
  floorPreference: z.enum(['low', 'mid', 'high']).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  roomTemperature: z.number().min(16).max(30).optional(),
  wakeUpCall: z.boolean().optional(),
  newspaper: z.string().optional(),
  smokingRoom: z.boolean().optional(),
  extraBed: z.boolean().optional(),
  specialRequests: z.string().max(500).optional(),
})
