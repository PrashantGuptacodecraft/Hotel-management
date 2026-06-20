import { z } from 'zod'
import { TABLE_STATUSES, ORDER_STATUSES, MENU_CATEGORIES } from '../lib/enums'

export const updateTableSchema = z.object({
  status: z.enum(TABLE_STATUSES).optional(),
  reservedFor: z.string().max(80).nullable().optional(),
})

export const createMenuItemSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(300).optional(),
  category: z.enum(MENU_CATEGORIES),
  price: z.number().positive(),
  prepTime: z.number().int().min(1).max(180).default(15),
  calories: z.number().int().min(0).optional(),
  tags: z.array(z.string()).default([]),
})

export const updateMenuItemSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  description: z.string().max(300).optional(),
  category: z.enum(MENU_CATEGORIES).optional(),
  price: z.number().positive().optional(),
  available: z.boolean().optional(),
  prepTime: z.number().int().min(1).max(180).optional(),
  tags: z.array(z.string()).optional(),
})

export const createOrderSchema = z.object({
  tableId: z.string().min(1),
  notes: z.string().max(300).optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
        notes: z.string().max(120).optional(),
      })
    )
    .min(1),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
})
