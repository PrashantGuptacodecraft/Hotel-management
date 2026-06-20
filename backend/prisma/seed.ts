// ============================================================
// LUXE GRAND — DATABASE SEED
// Deterministic, realistic data: 1 admin, ~30 staff, 280 rooms,
// 50 guests, ~120 bookings, tasks, reviews, a year of revenue,
// notifications, and 1 demo customer account.
//
//   Login credentials (all emails @luxegrand.com):
//     admin     → admin@luxegrand.com    / Admin@123
//     staff     → <name>@luxegrand.com   / Staff@123
//     customer  → customer@luxegrand.com / Customer@123
// ============================================================

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ---------- Seeded RNG ----------
function makeRng(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rng = makeRng(20260620)
const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]
const pickN = <T>(arr: T[], n: number): T[] => {
  const copy = [...arr]
  const out: T[] = []
  for (let i = 0; i < n && copy.length; i++) out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0])
  return out
}
const int = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min
const chance = (p: number) => rng() < p

const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000)
const J = (a: unknown[]) => JSON.stringify(a)

// ---------- Pools ----------
const firstNames = ['Aarav','Vivaan','Aditya','Ananya','Diya','Ishaan','Kabir','Saanvi','Arjun','Myra','Reyansh','Aanya','Vihaan','Kiara','Rohan','Priya','James','Olivia','William','Emma','Henry','Sophia','Lucas','Isabella','Liam','Mia','Noah','Charlotte','Ethan','Amelia','Hiroshi','Yuki','Chen','Mei','Mohammed','Fatima','Omar','Layla','Carlos','Sofia','Pierre','Camille','Hans','Greta','Luca','Giulia','Sven','Astrid','Dmitri','Natasha']
const lastNames = ['Sharma','Patel','Reddy','Kapoor','Nair','Iyer','Mehta','Singh','Gupta','Verma','Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Tanaka','Sato','Wang','Li','Al-Farsi','Hassan','Rossi','Müller','Dubois','Petrov']
const nationalities = ['India','United States','United Kingdom','Japan','China','UAE','France','Germany','Italy','Spain','Australia','Singapore','Russia','Brazil']
const views = ['city','garden','pool','sea','mountain']
const dietary = ['Vegetarian','Vegan','Gluten-free','Halal','Kosher','Nut allergy']
const guestTags = ['VIP','Repeat Guest','Honeymoon','Business','Family','Long Stay','Corporate','Influencer']
const amenitiesPool = ['WiFi','Smart TV','Mini Bar','Espresso Machine','Safe','Bathtub','Rain Shower','Balcony','Work Desk','Sound System','Smart Lighting','Butler Service','Jacuzzi','Private Pool','Walk-in Closet']
const avatar = (s: string) => `https://i.pravatar.cc/150?u=${encodeURIComponent(s)}`

type RoomType = 'STANDARD' | 'DELUXE' | 'SUITE' | 'PRESIDENTIAL' | 'PENTHOUSE'
const basePriceByType: Record<RoomType, number> = { STANDARD: 220, DELUXE: 380, SUITE: 720, PRESIDENTIAL: 1500, PENTHOUSE: 3200 }
const capByType: Record<RoomType, number> = { STANDARD: 2, DELUXE: 3, SUITE: 4, PRESIDENTIAL: 6, PENTHOUSE: 8 }
const roomTypeByFloor = (f: number): RoomType => {
  if (f >= 10) return chance(0.5) ? 'PENTHOUSE' : 'PRESIDENTIAL'
  if (f >= 8) return pick<RoomType>(['SUITE', 'PRESIDENTIAL', 'SUITE'])
  if (f >= 6) return pick<RoomType>(['DELUXE', 'SUITE', 'DELUXE'])
  if (f >= 3) return pick<RoomType>(['STANDARD', 'DELUXE', 'DELUXE'])
  return pick<RoomType>(['STANDARD', 'STANDARD', 'DELUXE'])
}
const roomStatus = (): string => {
  const r = rng()
  if (r < 0.52) return 'OCCUPIED'
  if (r < 0.74) return 'AVAILABLE'
  if (r < 0.86) return 'CLEANING'
  if (r < 0.93) return 'RESERVED'
  if (r < 0.98) return 'CHECKOUT'
  return 'MAINTENANCE'
}

async function main() {
  console.log('🌱 Seeding Luxe Grand…')

  // ---- Clean (FK-safe order) ----
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.restaurantTable.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.hotelEvent.deleteMany()
  await prisma.eventVenue.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.task.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.bookingAddon.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.review.deleteMany()
  await prisma.message.deleteMany()
  await prisma.maintenanceLog.deleteMany()
  await prisma.guestPreference.deleteMany()
  await prisma.user.deleteMany()
  await prisma.guest.deleteMany()
  await prisma.room.deleteMany()
  await prisma.revenueRecord.deleteMany()

  const adminPwd = bcrypt.hashSync('Admin@123', 12)
  const staffPwd = bcrypt.hashSync('Staff@123', 12)
  const customerPwd = bcrypt.hashSync('Customer@123', 12)

  // ---- Admin ----
  const admin = await prisma.user.create({
    data: {
      name: 'Vikram Anand',
      email: 'admin@luxegrand.com',
      password: adminPwd,
      role: 'ADMIN',
      department: 'Management',
      avatar: avatar('admin-vikram'),
      emailVerified: true,
    },
  })

  // ---- Staff ----
  const staffRoles = ['MANAGER','RECEPTIONIST','HOUSEKEEPING','CONCIERGE','CHEF','SECURITY','RECEPTIONIST','HOUSEKEEPING','MANAGER']
  const deptByRole: Record<string, string> = { MANAGER:'Management', RECEPTIONIST:'Front Desk', HOUSEKEEPING:'Housekeeping', CONCIERGE:'Concierge', CHEF:'F&B', SECURITY:'Security' }
  const staff = [admin]
  for (let i = 0; i < 30; i++) {
    const role = staffRoles[i % staffRoles.length]
    const name = `${pick(firstNames)} ${pick(lastNames)}`
    const u = await prisma.user.create({
      data: {
        name,
        email: `${name.toLowerCase().replace(/[^a-z]/g, '.')}.${i}@luxegrand.com`,
        password: staffPwd,
        role,
        department: deptByRole[role],
        avatar: avatar(`staff-${i}`),
        emailVerified: true,
        isOnline: chance(0.5),
      },
    })
    staff.push(u)
  }

  // ---- Rooms (280) ----
  const roomData = []
  for (let floor = 1; floor <= 10; floor++) {
    for (let n = 1; n <= 28; n++) {
      const type = roomTypeByFloor(floor)
      const base = basePriceByType[type]
      const number = `${floor}${String(n).padStart(2, '0')}`
      roomData.push({
        number,
        floor,
        type,
        status: roomStatus(),
        basePrice: base,
        dynamicPrice: Math.round(base * (0.9 + rng() * 0.45)),
        capacity: capByType[type],
        amenities: J(pickN(amenitiesPool, int(4, 9))),
        view: pick(views),
        images: J([]),
        squareMeters: 28 + base / 30,
        lastCleaned: addDays(today, -int(0, 3)),
      })
    }
  }
  await prisma.room.createMany({ data: roomData })
  const rooms = await prisma.room.findMany()

  // ---- Guests (50) + preferences ----
  const tiers = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']
  const tierMult: Record<string, number> = { BRONZE: 1, SILVER: 2.4, GOLD: 4.2, PLATINUM: 7.5 }
  const guests = []
  for (let i = 0; i < 50; i++) {
    const name = `${pick(firstNames)} ${pick(lastNames)}`
    const tier = pick(tiers)
    const g = await prisma.guest.create({
      data: {
        name,
        email: `${name.toLowerCase().replace(/[^a-z]/g, '.')}.${i}@email.com`,
        phone: `+${int(1, 99)} ${int(70000, 99999)} ${int(10000, 99999)}`,
        nationality: pick(nationalities),
        avatar: avatar(`guest-${i}`),
        loyaltyTier: tier,
        loyaltyPoints: Math.round(int(200, 5000) * tierMult[tier]),
        totalStays: int(1, 12),
        totalSpend: Math.round(int(1200, 9000) * tierMult[tier]),
        sentimentScore: Math.round((0.6 + rng() * 0.4) * 100) / 100,
        tags: J(pickN(guestTags, int(1, 3))),
        isVIP: tier === 'PLATINUM',
        preferences: {
          create: {
            pillowType: pick(['soft', 'firm', 'memory-foam']),
            floorPreference: pick(['low', 'mid', 'high']),
            dietaryRestrictions: J(chance(0.5) ? pickN(dietary, int(1, 2)) : []),
            roomTemperature: int(19, 24),
          },
        },
      },
    })
    guests.push(g)
  }

  // ---- Demo customer (linked guest + account) ----
  const demoGuest = await prisma.guest.create({
    data: {
      name: 'Priya Customer',
      email: 'customer@luxegrand.com',
      phone: '+91 98765 43210',
      nationality: 'India',
      avatar: avatar('demo-customer'),
      loyaltyTier: 'GOLD',
      loyaltyPoints: 4200,
      totalStays: 6,
      totalSpend: 18400,
      tags: J(['Repeat Guest', 'VIP']),
      preferences: { create: { pillowType: 'memory-foam', floorPreference: 'high' } },
    },
  })
  await prisma.user.create({
    data: {
      name: 'Priya Customer',
      email: 'customer@luxegrand.com',
      password: customerPwd,
      role: 'CUSTOMER',
      avatar: avatar('demo-customer'),
      emailVerified: true,
      guestId: demoGuest.id,
    },
  })
  guests.push(demoGuest)

  // ---- Bookings (120) ----
  const sources = ['DIRECT','BOOKING_COM','EXPEDIA','AIRBNB','PHONE','WALKIN']
  const addonPool = [
    { name: 'Airport Transfer', price: 75 },
    { name: 'Spa Package', price: 220 },
    { name: 'Breakfast Buffet', price: 45 },
    { name: 'Late Checkout', price: 60 },
    { name: 'Champagne & Fruit', price: 120 },
  ]
  for (let i = 0; i < 120; i++) {
    const guest = i < 4 ? demoGuest : pick(guests) // ensure the demo customer has bookings
    const room = pick(rooms)
    const offset = int(-25, 30)
    const nights = int(1, 9)
    const checkIn = addDays(today, offset)
    const checkOut = addDays(checkIn, nights)
    let status: string
    if (checkOut < today) status = chance(0.92) ? 'CHECKED_OUT' : 'NO_SHOW'
    else if (checkIn <= today && checkOut >= today) status = 'CHECKED_IN'
    else status = chance(0.8) ? 'CONFIRMED' : chance(0.5) ? 'PENDING' : 'CANCELLED'

    const addons = chance(0.5) ? pickN(addonPool, int(1, 2)).map((a) => ({ ...a, quantity: int(1, 2) })) : []
    const roomTotal = room.dynamicPrice * nights
    const addonTotal = addons.reduce((s, a) => s + a.price * a.quantity, 0)
    const subtotal = roomTotal + addonTotal
    const total = subtotal + Math.round(subtotal * 0.12)
    const paid = status === 'CHECKED_OUT' || status === 'CHECKED_IN' || (status === 'CONFIRMED' && chance(0.7))

    await prisma.booking.create({
      data: {
        guestId: guest.id,
        roomId: room.id,
        checkIn,
        checkOut,
        nights,
        adults: int(1, Math.max(1, room.capacity)),
        children: chance(0.3) ? int(1, 2) : 0,
        status,
        source: pick(sources),
        totalAmount: total,
        paidAmount: paid ? total : 0,
        confirmedAt: status !== 'PENDING' && status !== 'CANCELLED' ? addDays(checkIn, -int(1, 20)) : null,
        checkedInAt: status === 'CHECKED_IN' || status === 'CHECKED_OUT' ? checkIn : null,
        checkedOutAt: status === 'CHECKED_OUT' ? checkOut : null,
        cancelledAt: status === 'CANCELLED' || status === 'NO_SHOW' ? addDays(checkIn, -1) : null,
        addons: addons.length ? { create: addons.map((a) => ({ name: a.name, price: a.price, quantity: a.quantity })) } : undefined,
        payment: paid ? { create: { amount: total, method: 'card', status: 'succeeded', transactionId: `SIM-${i}` } } : undefined,
      },
    })
  }

  // ---- Tasks (20) ----
  const taskTitles = [
    ['Deep clean room', 'housekeeping'], ['Fix AC unit', 'maintenance'], ['Restock minibar', 'housekeeping'],
    ['Deliver room service', 'room-service'], ['Arrange airport pickup', 'concierge'], ['Replace fixtures', 'maintenance'],
    ['Turndown service', 'housekeeping'], ['Set up event hall', 'other'], ['Welcome amenity setup', 'concierge'],
  ]
  for (let i = 0; i < 20; i++) {
    const [title, category] = pick(taskTitles)
    const room = chance(0.7) ? pick(rooms) : null
    const created = addDays(today, -int(0, 2))
    await prisma.task.create({
      data: {
        title: room ? `${title} ${room.number}` : title,
        description: `${title}${room ? ` for room ${room.number}` : ''}.`,
        assignedToId: pick(staff).id,
        createdById: admin.id,
        roomId: room?.id,
        priority: pick(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
        status: pick(['PENDING', 'PENDING', 'IN_PROGRESS', 'COMPLETED']),
        category,
        dueAt: addDays(created, int(0, 1)),
      },
    })
  }

  // ---- Reviews (30) ----
  for (let i = 0; i < 30; i++) {
    const rating = pick([5, 5, 4, 4, 4, 3, 5])
    await prisma.review.create({
      data: {
        guestId: pick(guests).id,
        rating,
        comment: pick(['Exceptional stay!', 'Loved the spa.', 'Great service, will return.', 'Room was spotless.', 'Staff went above and beyond.']),
        sentiment: rating / 5,
      },
    })
  }

  // ---- Restaurant: tables (24) ----
  const zones = ['Main', 'Main', 'Main', 'Terrace', 'Private', 'Bar']
  for (let i = 0; i < 24; i++) {
    await prisma.restaurantTable.create({
      data: {
        number: i + 1,
        capacity: pick([2, 2, 4, 4, 6, 8]),
        status: pick(['AVAILABLE', 'AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING']),
        zone: zones[i % zones.length],
        x: i % 6,
        y: Math.floor(i / 6),
        reservedFor: chance(0.25) ? `${pick(firstNames)} ${pick(lastNames)}` : null,
      },
    })
  }
  const tables = await prisma.restaurantTable.findMany()

  // ---- Restaurant: menu (12) ----
  const menuSeed = [
    ['Lobster Thermidor', 'Mains', 68, 540, 25], ['Wagyu Ribeye', 'Mains', 95, 720, 30],
    ['Truffle Risotto', 'Mains', 42, 480, 22], ['Pan-seared Foie Gras', 'Starters', 38, 310, 15],
    ['Burrata & Heirloom', 'Starters', 26, 280, 10], ['Tuna Tartare', 'Starters', 32, 240, 12],
    ['Saffron Bouillabaisse', 'Soups', 34, 360, 20], ['Dark Chocolate Soufflé', 'Desserts', 22, 420, 18],
    ['Crème Brûlée', 'Desserts', 18, 350, 8], ['Vintage Champagne', 'Beverages', 120, 90, 3],
    ['Single Malt Flight', 'Beverages', 85, 210, 5], ['Fresh Pressed Juice', 'Beverages', 14, 110, 4],
  ] as const
  for (const [name, category, price, calories, prepTime] of menuSeed) {
    await prisma.menuItem.create({
      data: {
        name,
        category,
        price,
        calories,
        prepTime,
        available: chance(0.85),
        description: 'Chef’s signature preparation with seasonal ingredients.',
        tags: J(pickN(['Signature', 'Chef Special', 'Seasonal', 'Vegetarian'], int(1, 2))),
      },
    })
  }
  const menu = await prisma.menuItem.findMany({ where: { available: true } })

  // ---- Restaurant: a few live orders ----
  const occupiedTables = tables.filter((t) => t.status === 'OCCUPIED')
  for (const table of occupiedTables.slice(0, 6)) {
    const picks = pickN(menu, int(1, 3))
    if (!picks.length) continue
    const lines = picks.map((m) => ({ menuItemId: m.id, quantity: int(1, 3), price: m.price }))
    const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0)
    const tax = Math.round(subtotal * 0.1 * 100) / 100
    await prisma.order.create({
      data: {
        tableId: table.id,
        status: pick(['PENDING', 'PREPARING', 'READY', 'SERVED']),
        subtotal,
        tax,
        total: subtotal + tax,
        items: { create: lines },
      },
    })
  }

  // ---- Events: venues + events ----
  const venueSeed = [
    ['Grand Ballroom', 500], ['Crystal Hall', 250], ['Garden Pavilion', 150], ['Executive Boardroom', 40],
  ] as const
  const venues = []
  for (const [name, capacity] of venueSeed) {
    venues.push(await prisma.eventVenue.create({ data: { name, capacity } }))
  }
  const eventTitles = [
    'Sharma–Patel Wedding', 'TechCorp Annual Gala', 'Diwali Charity Ball',
    'Global Finance Summit', 'Art & Wine Soirée', 'New Year Masquerade',
  ]
  const managers = staff.filter((s) => s.role === 'MANAGER' || s.role === 'ADMIN')
  for (const title of eventTitles) {
    const start = addDays(today, int(-3, 40))
    await prisma.hotelEvent.create({
      data: {
        title,
        description: 'A signature Luxe Grand event hosted in our grand ballroom.',
        venueId: pick(venues).id,
        hostName: `${pick(firstNames)} ${pick(lastNames)}`,
        startDate: start,
        endDate: addDays(start, int(0, 2)),
        guestCount: int(40, 400),
        status: pick(['TENTATIVE', 'CONFIRMED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED']),
        totalValue: int(15000, 180000),
        includes: J(pickN(['Catering', 'Decor', 'AV & Lighting', 'Valet', 'Photography', 'Live Band'], int(2, 4))),
        assignedManager: pick(managers).name,
      },
    })
  }

  // ---- Revenue (365 days) ----
  const revenueData = Array.from({ length: 365 }, (_, i) => {
    const date = addDays(today, -(364 - i))
    const dow = date.getDay()
    const weekend = dow === 5 || dow === 6 ? 1.35 : 1
    const seasonal = 1 + 0.25 * Math.sin((i / 365) * Math.PI * 2)
    const noise = 0.85 + rng() * 0.3
    const base = 78000 * weekend * seasonal * noise
    const r = Math.round(base * 0.62), f = Math.round(base * 0.18), s = Math.round(base * 0.08), e = Math.round(base * 0.09), o = Math.round(base * 0.03)
    return { date, rooms: r, fnb: f, spa: s, events: e, other: o, total: r + f + s + e + o }
  })
  await prisma.revenueRecord.createMany({ data: revenueData })

  // ---- Notifications ----
  await prisma.notification.createMany({
    data: [
      { type: 'booking', title: 'New Booking', message: 'A suite was just reserved for 4 nights', priority: 'normal' },
      { type: 'checkin', title: 'VIP Arrival', message: 'Platinum guest checking in at 3 PM', priority: 'high' },
      { type: 'maintenance', title: 'Maintenance Alert', message: 'AC reported faulty in room 415', priority: 'high' },
      { type: 'payment', title: 'Payment Received', message: '$2,840 settled for a booking', priority: 'normal', isRead: true },
      { type: 'message', title: 'Concierge Request', message: 'Room 1002 requests a dinner reservation', priority: 'low', isRead: true },
    ],
  })

  const counts = {
    users: await prisma.user.count(),
    rooms: await prisma.room.count(),
    guests: await prisma.guest.count(),
    bookings: await prisma.booking.count(),
    tasks: await prisma.task.count(),
    tables: await prisma.restaurantTable.count(),
    menu: await prisma.menuItem.count(),
    orders: await prisma.order.count(),
    events: await prisma.hotelEvent.count(),
    revenue: await prisma.revenueRecord.count(),
  }
  console.log('✅ Seed complete:', counts)
  console.log('   Admin:    admin@luxegrand.com / Admin@123')
  console.log('   Customer: customer@luxegrand.com / Customer@123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
