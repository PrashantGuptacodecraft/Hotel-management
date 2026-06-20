import type { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { ApiError } from '../lib/ApiError'
import { ok, created } from '../lib/response'
import { serializeGuest, fromJson, toJson } from '../lib/serialize'
import { paginate } from '../validators/common.schema'

const prefsOut = (p: { dietaryRestrictions: string } | null) =>
  p ? { ...p, dietaryRestrictions: fromJson(p.dietaryRestrictions) } : null

// GET /guests  (staff)
export async function listGuests(req: Request, res: Response): Promise<void> {
  const q = req.query as unknown as { search?: string; page: number; limit: number }
  const where = q.search
    ? {
        OR: [
          { name: { contains: q.search } },
          { email: { contains: q.search } },
        ],
      }
    : {}
  const p = paginate({ page: q.page, limit: q.limit, sortOrder: 'desc' })
  const [rows, total] = await Promise.all([
    prisma.guest.findMany({ where, orderBy: { createdAt: 'desc' }, skip: p.skip, take: p.take }),
    prisma.guest.count({ where }),
  ])
  ok(res, rows.map(serializeGuest), p.meta(total))
}

// GET /guests/:id  (staff) — full 360° view
export async function getGuest(req: Request, res: Response): Promise<void> {
  const guest = await prisma.guest.findUnique({
    where: { id: req.params.id },
    include: {
      preferences: true,
      reviews: { orderBy: { createdAt: 'desc' } },
      bookings: { include: { room: true }, orderBy: { createdAt: 'desc' } },
    },
  })
  if (!guest) throw ApiError.notFound('Guest not found')
  ok(res, { ...serializeGuest(guest), preferences: prefsOut(guest.preferences) })
}

// POST /guests  (staff)
export async function createGuest(req: Request, res: Response): Promise<void> {
  const b = req.body
  const guest = await prisma.guest.create({
    data: {
      name: b.name,
      email: b.email,
      phone: b.phone,
      nationality: b.nationality,
      passportNumber: b.passportNumber,
      tags: toJson(b.tags),
      isVIP: b.isVIP ?? false,
      preferences: { create: {} },
    },
  })
  created(res, serializeGuest(guest))
}

// PATCH /guests/:id  (staff)
export async function updateGuest(req: Request, res: Response): Promise<void> {
  const b = req.body
  const guest = await prisma.guest.update({
    where: { id: req.params.id },
    data: {
      ...(b.name !== undefined ? { name: b.name } : {}),
      ...(b.phone !== undefined ? { phone: b.phone } : {}),
      ...(b.nationality !== undefined ? { nationality: b.nationality } : {}),
      ...(b.passportNumber !== undefined ? { passportNumber: b.passportNumber } : {}),
      ...(b.tags !== undefined ? { tags: toJson(b.tags) } : {}),
      ...(b.isVIP !== undefined ? { isVIP: b.isVIP } : {}),
      ...(b.isBlacklisted !== undefined ? { isBlacklisted: b.isBlacklisted } : {}),
    },
  })
  ok(res, serializeGuest(guest))
}

// GET /guests/me/profile  (customer)
export async function myProfile(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
  if (!user?.guestId) throw ApiError.notFound('No guest profile')
  const guest = await prisma.guest.findUnique({
    where: { id: user.guestId },
    include: { preferences: true },
  })
  if (!guest) throw ApiError.notFound('No guest profile')
  ok(res, { ...serializeGuest(guest), preferences: prefsOut(guest.preferences) })
}

// PATCH /guests/me/preferences  (customer)
export async function updateMyPreferences(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
  if (!user?.guestId) throw ApiError.notFound('No guest profile')
  const b = req.body as {
    pillowType?: string
    floorPreference?: string
    dietaryRestrictions?: string[]
    roomTemperature?: number
    wakeUpCall?: boolean
    newspaper?: string
    smokingRoom?: boolean
    extraBed?: boolean
    specialRequests?: string
  }
  const data = {
    ...(b.pillowType !== undefined ? { pillowType: b.pillowType } : {}),
    ...(b.floorPreference !== undefined ? { floorPreference: b.floorPreference } : {}),
    ...(b.dietaryRestrictions !== undefined ? { dietaryRestrictions: toJson(b.dietaryRestrictions) } : {}),
    ...(b.roomTemperature !== undefined ? { roomTemperature: b.roomTemperature } : {}),
    ...(b.wakeUpCall !== undefined ? { wakeUpCall: b.wakeUpCall } : {}),
    ...(b.newspaper !== undefined ? { newspaper: b.newspaper } : {}),
    ...(b.smokingRoom !== undefined ? { smokingRoom: b.smokingRoom } : {}),
    ...(b.extraBed !== undefined ? { extraBed: b.extraBed } : {}),
    ...(b.specialRequests !== undefined ? { specialRequests: b.specialRequests } : {}),
  }
  const prefs = await prisma.guestPreference.upsert({
    where: { guestId: user.guestId },
    update: data,
    create: { guestId: user.guestId, ...data },
  })
  ok(res, prefsOut(prefs))
}
