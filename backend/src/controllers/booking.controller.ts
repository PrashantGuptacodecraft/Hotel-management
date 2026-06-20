import type { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { ApiError } from '../lib/ApiError'
import { ok, created } from '../lib/response'
import { serializeRoom } from '../lib/serialize'
import { paginate } from '../validators/common.schema'
import { createBooking as createBookingService } from '../services/booking.service'
import { resolveAddons } from '../lib/catalog'
import { emitToStaff } from '../socket/io'

const bookingInclude = { room: true, guest: true, addons: true, payment: true } as const

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const serializeBooking = (b: any) => ({ ...b, room: b.room ? serializeRoom(b.room) : b.room })

// GET /bookings  (staff)
export async function listBookings(req: Request, res: Response): Promise<void> {
  const q = req.query as unknown as {
    status?: string
    source?: string
    guestId?: string
    page: number
    limit: number
  }
  const where = {
    ...(q.status ? { status: q.status } : {}),
    ...(q.source ? { source: q.source } : {}),
    ...(q.guestId ? { guestId: q.guestId } : {}),
  }
  const p = paginate({ page: q.page, limit: q.limit, sortOrder: 'desc' })
  const [rows, total] = await Promise.all([
    prisma.booking.findMany({ where, include: bookingInclude, orderBy: { createdAt: 'desc' }, skip: p.skip, take: p.take }),
    prisma.booking.count({ where }),
  ])
  ok(res, rows.map(serializeBooking), p.meta(total))
}

// GET /bookings/mine  (customer)
export async function myBookings(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
  if (!user?.guestId) {
    ok(res, [])
    return
  }
  const rows = await prisma.booking.findMany({
    where: { guestId: user.guestId },
    include: bookingInclude,
    orderBy: { createdAt: 'desc' },
  })
  ok(res, rows.map(serializeBooking))
}

// GET /bookings/:id  (staff or owner)
export async function getBooking(req: Request, res: Response): Promise<void> {
  const booking = await prisma.booking.findUnique({ where: { id: req.params.id }, include: bookingInclude })
  if (!booking) throw ApiError.notFound('Booking not found')

  if (req.user!.role === 'CUSTOMER') {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
    if (user?.guestId !== booking.guestId) throw ApiError.forbidden('This booking is not yours')
  }
  ok(res, serializeBooking(booking))
}

// POST /bookings  (staff)
export async function createBooking(req: Request, res: Response): Promise<void> {
  const b = req.body
  const booking = await createBookingService({
    guestId: b.guestId,
    roomId: b.roomId,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    adults: b.adults,
    children: b.children,
    source: b.source,
    specialRequests: b.specialRequests,
    addons: b.addons,
    autoConfirmAndPay: false,
  })
  created(res, serializeBooking(booking))
}

// POST /bookings/book  (customer — self-service, auto pay+confirm)
export async function bookAsCustomer(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
  if (!user?.guestId) throw ApiError.badRequest('Your account has no guest profile')

  const b = req.body
  const booking = await createBookingService({
    guestId: user.guestId,
    roomId: b.roomId,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    adults: b.adults,
    children: b.children,
    source: 'DIRECT',
    specialRequests: b.specialRequests,
    addons: resolveAddons(b.addons),
    autoConfirmAndPay: true,
  })
  created(res, serializeBooking(booking))
}

// PATCH /bookings/:id/status  (staff)
export async function updateStatus(req: Request, res: Response): Promise<void> {
  const { status } = req.body
  const booking = await prisma.booking.findUnique({ where: { id: req.params.id }, include: { room: true, guest: true } })
  if (!booking) throw ApiError.notFound('Booking not found')

  const now = new Date()
  const data: Record<string, unknown> = { status }
  let roomStatus: string | null = null

  if (status === 'CONFIRMED') data.confirmedAt = now
  if (status === 'CHECKED_IN') {
    data.checkedInAt = now
    roomStatus = 'OCCUPIED'
  }
  if (status === 'CHECKED_OUT') {
    data.checkedOutAt = now
    roomStatus = 'CHECKOUT'
  }
  if (status === 'CANCELLED' || status === 'NO_SHOW') data.cancelledAt = now

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data,
    include: { room: true, guest: true, addons: true, payment: true },
  })

  if (roomStatus) {
    const room = await prisma.room.update({ where: { id: booking.roomId }, data: { status: roomStatus } })
    emitToStaff('room-updated', serializeRoom(room))
  }

  // On checkout, roll up guest loyalty stats.
  if (status === 'CHECKED_OUT') {
    await prisma.guest.update({
      where: { id: booking.guestId },
      data: {
        totalStays: { increment: 1 },
        totalSpend: { increment: booking.totalAmount },
        loyaltyPoints: { increment: Math.round(booking.totalAmount) },
      },
    })
  }

  emitToStaff('booking-updated', serializeBooking(updated))
  ok(res, serializeBooking(updated))
}

// PATCH /bookings/:id/cancel  (customer cancels own)
export async function cancelOwn(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
  const booking = await prisma.booking.findUnique({ where: { id: req.params.id } })
  if (!booking) throw ApiError.notFound('Booking not found')
  if (user?.guestId !== booking.guestId) throw ApiError.forbidden('This booking is not yours')
  if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
    throw ApiError.badRequest('This booking can no longer be cancelled')
  }
  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
    include: { room: true, guest: true, addons: true, payment: true },
  })
  emitToStaff('booking-updated', serializeBooking(updated))
  ok(res, serializeBooking(updated))
}
