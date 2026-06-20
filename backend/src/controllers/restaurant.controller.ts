import type { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { ApiError } from '../lib/ApiError'
import { ok, created } from '../lib/response'
import { fromJson, toJson } from '../lib/serialize'
import { emitToStaff } from '../socket/io'

const TAX_RATE = 0.1

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const menuOut = (m: any) => ({ ...m, tags: fromJson(m.tags) })

// ===================== TABLES =====================
export async function listTables(_req: Request, res: Response): Promise<void> {
  const tables = await prisma.restaurantTable.findMany({ orderBy: { number: 'asc' } })
  ok(res, tables)
}

export async function updateTable(req: Request, res: Response): Promise<void> {
  const exists = await prisma.restaurantTable.findUnique({ where: { id: req.params.id } })
  if (!exists) throw ApiError.notFound('Table not found')
  const { status, reservedFor } = req.body
  const table = await prisma.restaurantTable.update({
    where: { id: req.params.id },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(reservedFor !== undefined ? { reservedFor, reservedAt: reservedFor ? new Date() : null } : {}),
    },
  })
  emitToStaff('table-updated', table)
  ok(res, table)
}

// ===================== MENU =====================
export async function listMenu(_req: Request, res: Response): Promise<void> {
  const items = await prisma.menuItem.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] })
  ok(res, items.map(menuOut))
}

export async function createMenuItem(req: Request, res: Response): Promise<void> {
  const b = req.body
  const item = await prisma.menuItem.create({
    data: {
      name: b.name,
      description: b.description,
      category: b.category,
      price: b.price,
      prepTime: b.prepTime,
      calories: b.calories,
      tags: toJson(b.tags),
    },
  })
  created(res, menuOut(item))
}

export async function updateMenuItem(req: Request, res: Response): Promise<void> {
  const exists = await prisma.menuItem.findUnique({ where: { id: req.params.id } })
  if (!exists) throw ApiError.notFound('Menu item not found')
  const b = req.body
  const item = await prisma.menuItem.update({
    where: { id: req.params.id },
    data: {
      ...(b.name !== undefined ? { name: b.name } : {}),
      ...(b.description !== undefined ? { description: b.description } : {}),
      ...(b.category !== undefined ? { category: b.category } : {}),
      ...(b.price !== undefined ? { price: b.price } : {}),
      ...(b.available !== undefined ? { available: b.available } : {}),
      ...(b.prepTime !== undefined ? { prepTime: b.prepTime } : {}),
      ...(b.tags !== undefined ? { tags: toJson(b.tags) } : {}),
    },
  })
  ok(res, menuOut(item))
}

// ===================== ORDERS =====================
const orderInclude = { table: true, items: { include: { menuItem: true } } } as const
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const orderOut = (o: any) => ({
  ...o,
  items: o.items.map((it: any) => ({ ...it, menuItem: it.menuItem ? menuOut(it.menuItem) : null })),
})

export async function listOrders(_req: Request, res: Response): Promise<void> {
  const orders = await prisma.order.findMany({ include: orderInclude, orderBy: { createdAt: 'desc' }, take: 100 })
  ok(res, orders.map(orderOut))
}

export async function createOrder(req: Request, res: Response): Promise<void> {
  const { tableId, items, notes } = req.body as {
    tableId: string
    notes?: string
    items: { menuItemId: string; quantity: number; notes?: string }[]
  }

  const table = await prisma.restaurantTable.findUnique({ where: { id: tableId } })
  if (!table) throw ApiError.notFound('Table not found')

  // Price each line from the menu (server-trusted, prevents tampering).
  const menuIds = items.map((i) => i.menuItemId)
  const menuItems = await prisma.menuItem.findMany({ where: { id: { in: menuIds } } })
  const byId = new Map(menuItems.map((m) => [m.id, m]))

  const lines = items.map((i) => {
    const m = byId.get(i.menuItemId)
    if (!m) throw ApiError.badRequest(`Menu item ${i.menuItemId} not found`)
    if (!m.available) throw ApiError.badRequest(`${m.name} is currently unavailable`)
    return { menuItemId: m.id, quantity: i.quantity, price: m.price, notes: i.notes }
  })

  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0)
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100
  const total = subtotal + tax

  const order = await prisma.order.create({
    data: {
      tableId,
      notes,
      status: 'PENDING',
      subtotal,
      tax,
      total,
      items: { create: lines },
    },
    include: orderInclude,
  })

  // Seat the table.
  await prisma.restaurantTable.update({ where: { id: tableId }, data: { status: 'OCCUPIED' } })

  emitToStaff('order-created', orderOut(order))
  created(res, orderOut(order))
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } })
  if (!order) throw ApiError.notFound('Order not found')
  const { status } = req.body

  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: { status, ...(status === 'SERVED' ? { servedAt: new Date() } : {}) },
    include: orderInclude,
  })

  // When paid/cancelled, free the table for cleaning.
  if (status === 'PAID' || status === 'CANCELLED') {
    const table = await prisma.restaurantTable.update({ where: { id: order.tableId }, data: { status: 'CLEANING' } })
    emitToStaff('table-updated', table)
  }

  emitToStaff('order-updated', orderOut(updated))
  ok(res, orderOut(updated))
}
