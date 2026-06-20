import { z } from 'zod'
import { STAFF_ROLES } from '../lib/enums'

const staffRoleEnum = z.enum(STAFF_ROLES as [string, ...string[]])

export const listStaffQuery = z.object({
  department: z.string().optional(),
  role: staffRoleEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(100),
})

export const createStaffSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(100),
  role: staffRoleEnum,
  department: z.string().min(2).max(60),
})

export const updateStaffSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  role: staffRoleEnum.optional(),
  department: z.string().min(2).max(60).optional(),
})
