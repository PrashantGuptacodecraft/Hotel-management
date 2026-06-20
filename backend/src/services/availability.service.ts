import { prisma } from '../config/prisma'
import { ACTIVE_BOOKING_STATUSES } from '../lib/enums'

/**
 * Two date ranges [aStart,aEnd) and [bStart,bEnd) overlap iff
 * aStart < bEnd && aEnd > bStart.
 */
export async function isRoomAvailable(
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  excludeBookingId?: string
): Promise<boolean> {
  const clash = await prisma.booking.findFirst({
    where: {
      roomId,
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      status: { in: ACTIVE_BOOKING_STATUSES },
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
    select: { id: true },
  })
  return !clash
}

/** Room ids that are occupied for any part of [checkIn, checkOut). */
export async function unavailableRoomIds(checkIn: Date, checkOut: Date): Promise<Set<string>> {
  const clashes = await prisma.booking.findMany({
    where: {
      status: { in: ACTIVE_BOOKING_STATUSES },
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
    select: { roomId: true },
  })
  return new Set(clashes.map((c) => c.roomId))
}

/** Rooms bookable for the given window (optionally filtered). */
export async function findAvailableRooms(args: {
  checkIn: Date
  checkOut: Date
  type?: string
  capacity?: number
}) {
  const taken = await unavailableRoomIds(args.checkIn, args.checkOut)
  const rooms = await prisma.room.findMany({
    where: {
      id: { notIn: [...taken] },
      status: { notIn: ['MAINTENANCE'] },
      ...(args.type ? { type: args.type } : {}),
      ...(args.capacity ? { capacity: { gte: args.capacity } } : {}),
    },
    orderBy: [{ floor: 'asc' }, { number: 'asc' }],
  })
  return rooms
}
