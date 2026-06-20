import type { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { ApiError } from '../lib/ApiError'
import { ok, created } from '../lib/response'
import { serializeRoom, toJson } from '../lib/serialize'
import { findAvailableRooms } from '../services/availability.service'
import { emitToStaff } from '../socket/io'

// GET /rooms  (staff) — full list with optional filters
export async function listRooms(req: Request, res: Response): Promise<void> {
  const { status, type, floor } = req.query as Record<string, string | undefined>
  const rooms = await prisma.room.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
      ...(floor ? { floor: Number(floor) } : {}),
    },
    orderBy: [{ floor: 'asc' }, { number: 'asc' }],
  })
  ok(res, rooms.map(serializeRoom))
}

// GET /rooms/available  (public) — bookable rooms for a date window
export async function availableRooms(req: Request, res: Response): Promise<void> {
  const { checkIn, checkOut, type, capacity } = req.query as unknown as {
    checkIn: Date
    checkOut: Date
    type?: string
    capacity?: number
  }
  if (checkOut <= checkIn) throw ApiError.badRequest('Check-out must be after check-in')
  const rooms = await findAvailableRooms({ checkIn, checkOut, type, capacity })
  ok(res, rooms.map(serializeRoom))
}

// GET /rooms/:id
export async function getRoom(req: Request, res: Response): Promise<void> {
  const room = await prisma.room.findUnique({ where: { id: req.params.id } })
  if (!room) throw ApiError.notFound('Room not found')
  ok(res, serializeRoom(room))
}

// POST /rooms  (admin)
export async function createRoom(req: Request, res: Response): Promise<void> {
  const b = req.body
  const room = await prisma.room.create({
    data: {
      number: b.number,
      floor: b.floor,
      type: b.type,
      basePrice: b.basePrice,
      dynamicPrice: b.dynamicPrice ?? b.basePrice,
      capacity: b.capacity,
      amenities: toJson(b.amenities),
      view: b.view,
      description: b.description,
      images: toJson(b.images),
      squareMeters: b.squareMeters,
    },
  })
  created(res, serializeRoom(room))
}

// PATCH /rooms/:id  (staff)
export async function updateRoom(req: Request, res: Response): Promise<void> {
  const b = req.body
  const exists = await prisma.room.findUnique({ where: { id: req.params.id } })
  if (!exists) throw ApiError.notFound('Room not found')

  const room = await prisma.room.update({
    where: { id: req.params.id },
    data: {
      ...(b.status !== undefined ? { status: b.status } : {}),
      ...(b.type !== undefined ? { type: b.type } : {}),
      ...(b.basePrice !== undefined ? { basePrice: b.basePrice } : {}),
      ...(b.dynamicPrice !== undefined ? { dynamicPrice: b.dynamicPrice } : {}),
      ...(b.capacity !== undefined ? { capacity: b.capacity } : {}),
      ...(b.amenities !== undefined ? { amenities: toJson(b.amenities) } : {}),
      ...(b.description !== undefined ? { description: b.description } : {}),
      ...(b.temperature !== undefined ? { temperature: b.temperature } : {}),
      ...(b.lighting !== undefined ? { lighting: b.lighting } : {}),
      ...(b.status === 'CLEANING' || b.status === 'AVAILABLE' ? { lastCleaned: new Date() } : {}),
    },
  })
  const serialized = serializeRoom(room)
  emitToStaff('room-updated', serialized)
  ok(res, serialized)
}

// DELETE /rooms/:id  (admin)
export async function deleteRoom(req: Request, res: Response): Promise<void> {
  await prisma.room.delete({ where: { id: req.params.id } })
  ok(res, { message: 'Room deleted' })
}
