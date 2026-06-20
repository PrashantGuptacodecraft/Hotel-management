import { prisma } from '../config/prisma'
import { ApiError } from '../lib/ApiError'
import { isRoomAvailable } from './availability.service'
import { sendBookingConfirmation } from '../lib/email'
import { emitToStaff } from '../socket/io'
import { serializeRoom } from '../lib/serialize'

const TAX_RATE = 0.12

export interface AddonInput {
  name: string
  price: number
  quantity: number
}

interface CreateBookingArgs {
  guestId: string
  roomId: string
  checkIn: Date
  checkOut: Date
  adults: number
  children: number
  source?: string
  specialRequests?: string
  addons?: AddonInput[]
  /** When true (customer flow), the booking is paid + confirmed immediately. */
  autoConfirmAndPay?: boolean
}

const nightsBetween = (a: Date, b: Date): number =>
  Math.max(1, Math.round((b.getTime() - a.getTime()) / 86_400_000))

export function priceBooking(roomNightly: number, nights: number, addons: AddonInput[] = []) {
  const roomTotal = roomNightly * nights
  const addonsTotal = addons.reduce((s, a) => s + a.price * a.quantity, 0)
  const subtotal = roomTotal + addonsTotal
  const tax = Math.round(subtotal * TAX_RATE)
  return { roomTotal, addonsTotal, subtotal, tax, total: subtotal + tax }
}

export async function createBooking(args: CreateBookingArgs) {
  if (args.checkOut <= args.checkIn) throw ApiError.badRequest('Check-out must be after check-in')

  const room = await prisma.room.findUnique({ where: { id: args.roomId } })
  if (!room) throw ApiError.notFound('Room not found')

  const available = await isRoomAvailable(args.roomId, args.checkIn, args.checkOut)
  if (!available) throw ApiError.conflict('This room is not available for the selected dates')

  const guest = await prisma.guest.findUnique({ where: { id: args.guestId } })
  if (!guest) throw ApiError.notFound('Guest not found')

  const nights = nightsBetween(args.checkIn, args.checkOut)
  if (args.adults + args.children > room.capacity) {
    throw ApiError.badRequest(`This room accommodates up to ${room.capacity} guests`)
  }

  const pricing = priceBooking(room.dynamicPrice, nights, args.addons)
  const paid = args.autoConfirmAndPay

  const booking = await prisma.booking.create({
    data: {
      guestId: args.guestId,
      roomId: args.roomId,
      checkIn: args.checkIn,
      checkOut: args.checkOut,
      nights,
      adults: args.adults,
      children: args.children,
      status: paid ? 'CONFIRMED' : 'PENDING',
      source: args.source ?? 'DIRECT',
      totalAmount: pricing.total,
      paidAmount: paid ? pricing.total : 0,
      specialRequests: args.specialRequests,
      confirmedAt: paid ? new Date() : null,
      addons: args.addons?.length
        ? { create: args.addons.map((a) => ({ name: a.name, price: a.price, quantity: a.quantity })) }
        : undefined,
      payment: paid
        ? {
            create: {
              amount: pricing.total,
              method: 'card',
              status: 'succeeded',
              transactionId: `SIM-${Date.now()}`,
            },
          }
        : undefined,
    },
    include: { room: true, guest: true, addons: true, payment: true },
  })

  // Side effects (best-effort; never block the response).
  await sendBookingConfirmation(guest.email, guest.name, {
    bookingNumber: booking.bookingNumber,
    room: `${room.type} · Room ${room.number}`,
    checkIn: args.checkIn.toDateString(),
    checkOut: args.checkOut.toDateString(),
    total: `${booking.currency} ${pricing.total.toLocaleString()}`,
  }).catch((e) => console.error('Confirmation email failed:', e?.message))

  await prisma.notification.create({
    data: {
      type: 'booking',
      title: 'New Booking',
      message: `${guest.name} booked Room ${room.number} (${nights}N)`,
      priority: 'normal',
    },
  })

  emitToStaff('booking-created', { ...booking, room: serializeRoom(booking.room) })

  // Return the raw booking (room amenities still a JSON string); the
  // controller serializes exactly once before responding.
  return { ...booking, pricing }
}
