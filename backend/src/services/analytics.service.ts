import { prisma } from '../config/prisma'
import { serializeRoom } from '../lib/serialize'

const DAY = 86_400_000
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

/** Count of rooms holding a guest on a given calendar day (booking-based). */
function occupiedOnDay(
  bookings: { checkIn: Date; checkOut: Date }[],
  day: Date
): number {
  const dayStart = startOfDay(day).getTime()
  const nextDay = dayStart + DAY
  return bookings.filter((b) => b.checkIn.getTime() < nextDay && b.checkOut.getTime() > dayStart).length
}

/** Daily occupancy % series for the last `days` days. */
async function occupancySeries(totalRooms: number, days: number) {
  const today = startOfDay(new Date())
  const start = new Date(today.getTime() - (days - 1) * DAY)
  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
      checkIn: { lt: new Date(today.getTime() + DAY) },
      checkOut: { gt: start },
    },
    select: { checkIn: true, checkOut: true },
  })
  return Array.from({ length: days }, (_, i) => {
    const day = new Date(start.getTime() + i * DAY)
    const occ = occupiedOnDay(bookings, day)
    return {
      date: day.toISOString(),
      roomsOccupied: occ,
      occupancyRate: totalRooms ? Math.round((occ / totalRooms) * 100) : 0,
    }
  })
}

export async function getRevenueSeries(days: number) {
  const since = new Date(startOfDay(new Date()).getTime() - (days - 1) * DAY)
  const records = await prisma.revenueRecord.findMany({
    where: { date: { gte: since } },
    orderBy: { date: 'asc' },
  })
  return records.map((r) => ({
    date: r.date.toISOString(),
    rooms: r.rooms,
    fnb: r.fnb,
    spa: r.spa,
    events: r.events,
    other: r.other,
    total: r.total,
  }))
}

export async function getDashboard() {
  const today = startOfDay(new Date())

  const [totalRooms, occupiedRooms, statusGroups, activeGuests, pendingTasks, reviewAgg] =
    await Promise.all([
      prisma.room.count(),
      prisma.room.count({ where: { status: 'OCCUPIED' } }),
      prisma.room.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.booking.count({ where: { status: 'CHECKED_IN' } }),
      prisma.task.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
      prisma.review.aggregate({ _avg: { rating: true } }),
    ])

  const revenue = await getRevenueSeries(30)
  const occSeries = await occupancySeries(totalRooms, 30)

  const todayRev = revenue[revenue.length - 1]
  const yesterdayRev = revenue[revenue.length - 2]
  const revenueToday = todayRev?.total ?? 0
  const revenueGrowth = yesterdayRev?.total
    ? Math.round(((revenueToday - yesterdayRev.total) / yesterdayRev.total) * 1000) / 10
    : 0

  const occToday = occSeries[occSeries.length - 1]?.occupancyRate ?? 0
  const occWeekAgo = occSeries[occSeries.length - 8]?.occupancyRate ?? occToday
  const occupancyGrowth = occWeekAgo
    ? Math.round(((occToday - occWeekAgo) / occWeekAgo) * 1000) / 10
    : 0

  const roomsRevenue = todayRev?.rooms ?? 0
  const occupancyRate = totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0

  const stayAgg = await prisma.booking.aggregate({ _avg: { nights: true } })

  const statusCounts: Record<string, number> = {}
  for (const g of statusGroups) statusCounts[g.status] = g._count.status

  const kpis = {
    revenueToday,
    revenueGrowth,
    occupancyRate,
    occupancyGrowth,
    activeGuests,
    pendingTasks,
    revpar: totalRooms ? Math.round(roomsRevenue / totalRooms) : 0,
    adr: occupiedRooms ? Math.round(roomsRevenue / occupiedRooms) : 0,
    goppar: totalRooms ? Math.round((revenueToday * 0.42) / totalRooms) : 0,
    avgStayLength: Math.round((stayAgg._avg.nights ?? 0) * 10) / 10,
    guestSatisfaction: Math.round((reviewAgg._avg.rating ?? 4.6) * 20),
  }

  const sparklines = {
    revenue: revenue.slice(-14).map((d) => ({ v: d.total })),
    occupancy: occSeries.slice(-14).map((d) => ({ v: d.occupancyRate })),
    guests: occSeries.slice(-14).map((d) => ({ v: d.roomsOccupied })),
    tasks: revenue.slice(-14).map((d) => ({ v: Math.round(d.events / 1000) })),
  }

  // Today's timeline
  const tomorrow = new Date(today.getTime() + DAY)
  const soon = new Date(today.getTime() + 2 * DAY)
  const [arrivals, departures] = await Promise.all([
    prisma.booking.findMany({
      where: { status: 'CONFIRMED', checkIn: { gte: today, lt: soon } },
      include: { guest: true, room: true },
      orderBy: { checkIn: 'asc' },
      take: 8,
    }),
    prisma.booking.findMany({
      where: { status: 'CHECKED_IN', checkOut: { gte: today, lt: soon } },
      include: { guest: true, room: true },
      orderBy: { checkOut: 'asc' },
      take: 8,
    }),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shape = (b: any) => ({ ...b, room: serializeRoom(b.room) })

  return {
    kpis,
    revenue30d: revenue,
    sparklines,
    statusCounts,
    arrivals: arrivals.map(shape),
    departures: departures.map(shape),
    tomorrow: tomorrow.toISOString(),
  }
}

export async function getOverview() {
  const totalRooms = await prisma.room.count()
  const [revenue, occ] = await Promise.all([getRevenueSeries(90), occupancySeries(totalRooms, 90)])
  const series = revenue.map((r, i) => {
    const occupied = occ[i]?.roomsOccupied ?? 0
    return {
      date: r.date,
      revpar: totalRooms ? Math.round(r.rooms / totalRooms) : 0,
      adr: occupied ? Math.round(r.rooms / occupied) : 0,
      occupancyRate: occ[i]?.occupancyRate ?? 0,
      total: r.total,
    }
  })
  const breakdown = revenue.reduce(
    (acc, r) => ({
      rooms: acc.rooms + r.rooms,
      fnb: acc.fnb + r.fnb,
      spa: acc.spa + r.spa,
      events: acc.events + r.events,
      other: acc.other + r.other,
    }),
    { rooms: 0, fnb: 0, spa: 0, events: 0, other: 0 }
  )
  return { series, breakdown }
}
