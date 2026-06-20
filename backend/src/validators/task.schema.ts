import { z } from 'zod'
import { TASK_PRIORITIES, TASK_STATUSES } from '../lib/enums'

export const listTasksQuery = z.object({
  status: z.enum(TASK_STATUSES).optional(),
  assignedToId: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(100),
})

export const createTaskSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  assignedToId: z.string().min(1),
  roomId: z.string().optional(),
  priority: z.enum(TASK_PRIORITIES).default('MEDIUM'),
  category: z.string().min(2).max(40),
  dueAt: z.coerce.date().optional(),
})

export const updateTaskSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  description: z.string().max(500).optional(),
  assignedToId: z.string().optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  status: z.enum(TASK_STATUSES).optional(),
})
