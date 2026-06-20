import type { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { ApiError } from '../lib/ApiError'
import { ok, created } from '../lib/response'
import { fromJson, toJson } from '../lib/serialize'
import { emitToStaff } from '../socket/io'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const eventOut = (e: any) => ({ ...e, includes: fromJson(e.includes) })

// GET /events/venues
export async function listVenues(_req: Request, res: Response): Promise<void> {
  const venues = await prisma.eventVenue.findMany({ orderBy: { name: 'asc' } })
  ok(res, venues)
}

// GET /events
export async function listEvents(_req: Request, res: Response): Promise<void> {
  const events = await prisma.hotelEvent.findMany({ include: { venue: true }, orderBy: { startDate: 'asc' } })
  ok(res, events.map(eventOut))
}

// POST /events
export async function createEvent(req: Request, res: Response): Promise<void> {
  const b = req.body
  if (b.endDate < b.startDate) throw ApiError.badRequest('End date must be after start date')
  const venue = await prisma.eventVenue.findUnique({ where: { id: b.venueId } })
  if (!venue) throw ApiError.notFound('Venue not found')

  const event = await prisma.hotelEvent.create({
    data: {
      title: b.title,
      description: b.description,
      venueId: b.venueId,
      hostName: b.hostName,
      startDate: b.startDate,
      endDate: b.endDate,
      guestCount: b.guestCount,
      totalValue: b.totalValue,
      includes: toJson(b.includes),
      assignedManager: b.assignedManager,
      status: 'TENTATIVE',
    },
    include: { venue: true },
  })
  emitToStaff('event-updated', eventOut(event))
  created(res, eventOut(event))
}

// PATCH /events/:id
export async function updateEvent(req: Request, res: Response): Promise<void> {
  const exists = await prisma.hotelEvent.findUnique({ where: { id: req.params.id } })
  if (!exists) throw ApiError.notFound('Event not found')
  const b = req.body
  const event = await prisma.hotelEvent.update({
    where: { id: req.params.id },
    data: {
      ...(b.title !== undefined ? { title: b.title } : {}),
      ...(b.description !== undefined ? { description: b.description } : {}),
      ...(b.venueId !== undefined ? { venueId: b.venueId } : {}),
      ...(b.hostName !== undefined ? { hostName: b.hostName } : {}),
      ...(b.startDate !== undefined ? { startDate: b.startDate } : {}),
      ...(b.endDate !== undefined ? { endDate: b.endDate } : {}),
      ...(b.guestCount !== undefined ? { guestCount: b.guestCount } : {}),
      ...(b.status !== undefined ? { status: b.status } : {}),
      ...(b.totalValue !== undefined ? { totalValue: b.totalValue } : {}),
      ...(b.includes !== undefined ? { includes: toJson(b.includes) } : {}),
      ...(b.assignedManager !== undefined ? { assignedManager: b.assignedManager } : {}),
    },
    include: { venue: true },
  })
  emitToStaff('event-updated', eventOut(event))
  ok(res, eventOut(event))
}

// DELETE /events/:id
export async function deleteEvent(req: Request, res: Response): Promise<void> {
  await prisma.hotelEvent.delete({ where: { id: req.params.id } })
  ok(res, { message: 'Event deleted' })
}
