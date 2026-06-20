import { z } from 'zod'
import { EVENT_STATUSES } from '../lib/enums'

export const createEventSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  venueId: z.string().min(1),
  hostName: z.string().min(2).max(80),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  guestCount: z.number().int().min(1).max(2000),
  totalValue: z.number().min(0),
  includes: z.array(z.string()).default([]),
  assignedManager: z.string().max(80).optional(),
})

export const updateEventSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  description: z.string().max(500).optional(),
  venueId: z.string().optional(),
  hostName: z.string().min(2).max(80).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  guestCount: z.number().int().min(1).max(2000).optional(),
  status: z.enum(EVENT_STATUSES).optional(),
  totalValue: z.number().min(0).optional(),
  includes: z.array(z.string()).optional(),
  assignedManager: z.string().max(80).optional(),
})
