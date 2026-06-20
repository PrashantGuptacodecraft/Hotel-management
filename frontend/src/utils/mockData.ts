// ============================================================
// LUXE GRAND — MOCK DATA LAYER
// Deterministic, realistic seed data for the entire platform.
// Everything is generated from a seeded RNG so values stay
// stable across renders (no flicker in counters / charts).
// ============================================================

import type {
  Guest,
  Room,
  RoomStatus,
  RoomType,
  Booking,
  BookingStatus,
  BookingSource,
  Staff,
  StaffDepartment,
  Task,
  RevenueData,
  OccupancyData,
  KPIMetrics,
  Notification,
  RestaurantTable,
  MenuItem,
  HotelEvent,
  LoyaltyTier,
} from '@/types'

// ---------- Seeded RNG (mulberry32) ----------
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
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0])
  }
  return out
}
const int = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min
const chance = (p: number) => rng() < p

// ---------- Date helpers ----------
const NOW = new Date()
const today = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate())
const addDays = (d: Date, n: number) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
const iso = (d: Date) => d.toISOString()

// ---------- Reference pools ----------
const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Ananya', 'Diya', 'Ishaan', 'Kabir', 'Saanvi',
  'Arjun', 'Myra', 'Reyansh', 'Aanya', 'Vihaan', 'Kiara', 'Rohan', 'Priya',
  'James', 'Olivia', 'William', 'Emma', 'Henry', 'Sophia', 'Lucas', 'Isabella',
  'Liam', 'Mia', 'Noah', 'Charlotte', 'Ethan', 'Amelia', 'Hiroshi', 'Yuki',
  'Chen', 'Mei', 'Mohammed', 'Fatima', 'Omar', 'Layla', 'Carlos', 'Sofia',
  'Pierre', 'Camille', 'Hans', 'Greta', 'Luca', 'Giulia', 'Sven', 'Astrid',
  'Dmitri', 'Natasha',
]
const lastNames = [
  'Sharma', 'Patel', 'Reddy', 'Kapoor', 'Nair', 'Iyer', 'Mehta', 'Singh',
  'Gupta', 'Verma', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia',
  'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Tanaka', 'Sato', 'Wang', 'Li',
  'Al-Farsi', 'Hassan', 'Rossi', 'Müller', 'Dubois', 'Petrov',
]
const nationalities = [
  'India', 'United States', 'United Kingdom', 'Japan', 'China', 'UAE', 'France',
  'Germany', 'Italy', 'Spain', 'Australia', 'Singapore', 'Russia', 'Brazil',
]
const cityViews: Room['view'][] = ['city', 'garden', 'pool', 'sea', 'mountain']
const dietary = ['Vegetarian', 'Vegan', 'Gluten-free', 'Halal', 'Kosher', 'Nut allergy', 'Lactose-free']
const guestTags = ['VIP', 'Repeat Guest', 'Honeymoon', 'Business', 'Family', 'Long Stay', 'Corporate', 'Influencer']
const newspapers = ['The Times', 'WSJ', 'Financial Times', 'The Hindu', 'None']

const avatarFor = (seed: string) =>
  `https://i.pravatar.cc/150?u=${encodeURIComponent(seed)}`

// ============================================================
// GUESTS
// ============================================================
const loyaltyTiers: LoyaltyTier[] = ['bronze', 'silver', 'gold', 'platinum']

export const guests: Guest[] = Array.from({ length: 50 }, (_, i) => {
  const name = `${pick(firstNames)} ${pick(lastNames)}`
  const tier = pick(loyaltyTiers)
  const tierMultiplier = { bronze: 1, silver: 2.4, gold: 4.2, platinum: 7.5 }[tier]
  const totalStays = Math.round(int(1, 8) * (tier === 'platinum' ? 3 : 1))
  return {
    id: `guest-${i + 1}`,
    name,
    email: `${name.toLowerCase().replace(/[^a-z]/g, '.')}@email.com`,
    phone: `+${int(1, 99)} ${int(70000, 99999)} ${int(10000, 99999)}`,
    avatar: avatarFor(`guest-${i + 1}`),
    nationality: pick(nationalities),
    passportNumber: chance(0.7) ? `P${int(1000000, 9999999)}` : undefined,
    loyaltyTier: tier,
    loyaltyPoints: Math.round(int(200, 5000) * tierMultiplier),
    totalStays,
    totalSpend: Math.round(int(1200, 9000) * tierMultiplier),
    preferences: {
      pillowType: pick(['soft', 'firm', 'memory-foam'] as const),
      floorPreference: pick(['low', 'mid', 'high'] as const),
      dietaryRestrictions: chance(0.5) ? pickN(dietary, int(1, 2)) : [],
      roomTemperature: int(19, 24),
      wakeUpCall: chance(0.4),
      newspaper: pick(newspapers),
      smokingRoom: chance(0.1),
      extraBed: chance(0.2),
      specialRequests: chance(0.3) ? pick([
        'High floor away from elevator',
        'Early check-in requested',
        'Allergic to feather pillows',
        'Celebrating anniversary',
        'Requires accessible bathroom',
      ]) : undefined,
    },
    tags: pickN(guestTags, int(1, 3)),
    sentimentScore: Math.round((0.6 + rng() * 0.4) * 100) / 100,
    createdAt: iso(addDays(today, -int(30, 900))),
  }
})

// ============================================================
// ROOMS — 280 rooms, 10 floors × 28 per floor
// ============================================================
const roomTypeByFloor = (floor: number): RoomType => {
  if (floor >= 10) return chance(0.5) ? 'penthouse' : 'presidential'
  if (floor >= 8) return pick(['suite', 'presidential', 'suite'] as const)
  if (floor >= 6) return pick(['deluxe', 'suite', 'deluxe'] as const)
  if (floor >= 3) return pick(['standard', 'deluxe', 'deluxe'] as const)
  return pick(['standard', 'standard', 'deluxe'] as const)
}
const basePriceByType: Record<RoomType, number> = {
  standard: 220,
  deluxe: 380,
  suite: 720,
  presidential: 1500,
  penthouse: 3200,
}
const capacityByType: Record<RoomType, number> = {
  standard: 2, deluxe: 3, suite: 4, presidential: 6, penthouse: 8,
}
const amenitiesPool = [
  'WiFi', 'Smart TV', 'Mini Bar', 'Espresso Machine', 'Safe', 'Bathtub',
  'Rain Shower', 'Balcony', 'Work Desk', 'Sound System', 'Smart Lighting',
  'Butler Service', 'Jacuzzi', 'Private Pool', 'Walk-in Closet',
]
const roomStatusWeighted = (): RoomStatus => {
  const r = rng()
  if (r < 0.52) return 'occupied'
  if (r < 0.74) return 'available'
  if (r < 0.86) return 'cleaning'
  if (r < 0.93) return 'reserved'
  if (r < 0.98) return 'checkout'
  return 'maintenance'
}

export const rooms: Room[] = []
for (let floor = 1; floor <= 10; floor++) {
  for (let n = 1; n <= 28; n++) {
    const type = roomTypeByFloor(floor)
    const base = basePriceByType[type]
    const status = roomStatusWeighted()
    const number = `${floor}${String(n).padStart(2, '0')}`
    rooms.push({
      id: `room-${number}`,
      number,
      floor,
      type,
      status,
      basePrice: base,
      dynamicPrice: Math.round(base * (0.9 + rng() * 0.45)),
      capacity: capacityByType[type],
      amenities: pickN(amenitiesPool, int(4, 9)),
      view: pick(cityViews),
      smartControls: {
        temperature: int(18, 24),
        lighting: int(20, 100),
        curtains: pick(['open', 'closed', 'partial'] as const),
        tv: chance(0.3),
        dnd: status === 'occupied' && chance(0.3),
        makeupRoom: status === 'cleaning',
      },
      lastCleaned: iso(addDays(today, -int(0, 3))),
      currentGuestId: status === 'occupied' ? `guest-${int(1, 50)}` : undefined,
      checkoutTime: status === 'occupied' || status === 'checkout'
        ? iso(addDays(today, int(1, 5)))
        : undefined,
    })
  }
}

// ============================================================
// STAFF — 30 across all departments
// ============================================================
const departments: StaffDepartment[] = [
  'front-desk', 'housekeeping', 'fnb', 'concierge', 'maintenance', 'management', 'security',
]
const rolesByDept: Record<StaffDepartment, string[]> = {
  'front-desk': ['Receptionist', 'Front Desk Manager', 'Guest Relations'],
  housekeeping: ['Room Attendant', 'Housekeeping Supervisor', 'Laundry Lead'],
  fnb: ['Executive Chef', 'Sous Chef', 'Sommelier', 'Waiter', 'Bartender'],
  concierge: ['Head Concierge', 'Concierge', 'Bell Captain'],
  maintenance: ['Maintenance Tech', 'Facilities Engineer', 'Electrician'],
  management: ['General Manager', 'Operations Director', 'Revenue Manager'],
  security: ['Security Officer', 'Security Lead'],
}

export const staff: Staff[] = Array.from({ length: 30 }, (_, i) => {
  const dept = departments[i % departments.length]
  const name = `${pick(firstNames)} ${pick(lastNames)}`
  const total = int(8, 24)
  return {
    id: `staff-${i + 1}`,
    name,
    email: `${name.toLowerCase().replace(/[^a-z]/g, '.')}@luxegrand.com`,
    phone: `+91 ${int(70000, 99999)} ${int(10000, 99999)}`,
    avatar: avatarFor(`staff-${i + 1}`),
    department: dept,
    role: pick(rolesByDept[dept]),
    shift: pick(['morning', 'afternoon', 'night'] as const),
    status: pick(['on-duty', 'on-duty', 'off-duty', 'break'] as const),
    tasksCompleted: int(0, total),
    tasksTotal: total,
    rating: Math.round((3.8 + rng() * 1.2) * 10) / 10,
    joinDate: iso(addDays(today, -int(120, 2200))),
  }
})

// ============================================================
// BOOKINGS — 120 across all statuses & sources
// ============================================================
const bookingSources: BookingSource[] = [
  'direct', 'booking.com', 'expedia', 'airbnb', 'phone', 'walkin',
]
const addonPool = [
  { name: 'Airport Transfer', price: 75 },
  { name: 'Spa Package', price: 220 },
  { name: 'Breakfast Buffet', price: 45 },
  { name: 'Late Checkout', price: 60 },
  { name: 'Champagne & Fruit', price: 120 },
  { name: 'Private Dining', price: 350 },
]

const bookingStatusWeighted = (checkIn: Date, checkOut: Date): BookingStatus => {
  if (checkOut < today) return chance(0.92) ? 'checked-out' : 'no-show'
  if (checkIn <= today && checkOut >= today) return 'checked-in'
  const r = rng()
  if (r < 0.78) return 'confirmed'
  if (r < 0.9) return 'pending'
  return 'cancelled'
}

export const bookings: Booking[] = Array.from({ length: 120 }, (_, i) => {
  const guest = pick(guests)
  const room = pick(rooms)
  const offset = int(-25, 30)
  const nights = int(1, 9)
  const checkIn = addDays(today, offset)
  const checkOut = addDays(checkIn, nights)
  const status = bookingStatusWeighted(checkIn, checkOut)
  const addons = chance(0.55)
    ? pickN(addonPool, int(1, 3)).map((a) => ({ ...a, quantity: int(1, 2) }))
    : []
  const roomTotal = room.dynamicPrice * nights
  const addonTotal = addons.reduce((s, a) => s + a.price * a.quantity, 0)
  const totalAmount = roomTotal + addonTotal
  const paidRatio = status === 'checked-out' ? 1
    : status === 'checked-in' ? (chance(0.6) ? 1 : 0.5)
    : status === 'cancelled' ? 0
    : pick([0, 0.5, 1])
  return {
    id: `booking-${i + 1}`,
    bookingNumber: `LG-${20260000 + i + 1}`,
    guestId: guest.id,
    guest,
    roomId: room.id,
    room,
    checkIn: iso(checkIn),
    checkOut: iso(checkOut),
    nights,
    adults: int(1, room.capacity),
    children: chance(0.3) ? int(1, 2) : 0,
    status,
    source: pick(bookingSources),
    totalAmount,
    paidAmount: Math.round(totalAmount * paidRatio),
    currency: 'USD',
    specialRequests: guest.preferences.specialRequests,
    addons,
    createdAt: iso(addDays(checkIn, -int(1, 60))),
    confirmedAt: status !== 'pending' && status !== 'cancelled' ? iso(addDays(checkIn, -int(1, 30))) : undefined,
    checkedInAt: status === 'checked-in' || status === 'checked-out' ? iso(checkIn) : undefined,
    checkedOutAt: status === 'checked-out' ? iso(checkOut) : undefined,
  }
})

// Today's arrivals & departures (derived) ----------------------
export const todayArrivals = bookings
  .filter((b) => new Date(b.checkIn).toDateString() === today.toDateString())
  .concat(
    bookings.filter(
      (b) => b.status === 'confirmed' && Math.abs(new Date(b.checkIn).getTime() - today.getTime()) < 2 * 864e5
    )
  )
  .slice(0, 6)

export const todayDepartures = bookings
  .filter(
    (b) =>
      b.status === 'checked-in' &&
      new Date(b.checkOut).getTime() - today.getTime() < 3 * 864e5
  )
  .slice(0, 6)

// ============================================================
// TASKS — 20 pending/in-progress
// ============================================================
const taskTemplates = [
  { title: 'Deep clean room', category: 'housekeeping' as const },
  { title: 'Fix AC unit', category: 'maintenance' as const },
  { title: 'Restock minibar', category: 'housekeeping' as const },
  { title: 'Deliver room service', category: 'room-service' as const },
  { title: 'Arrange airport pickup', category: 'concierge' as const },
  { title: 'Replace bathroom fixtures', category: 'maintenance' as const },
  { title: 'Turndown service', category: 'housekeeping' as const },
  { title: 'Set up event hall', category: 'other' as const },
  { title: 'Welcome amenity setup', category: 'concierge' as const },
  { title: 'Repair elevator panel', category: 'maintenance' as const },
]

export const tasks: Task[] = Array.from({ length: 20 }, (_, i) => {
  const t = pick(taskTemplates)
  const member = pick(staff)
  const room = chance(0.7) ? pick(rooms) : undefined
  const created = addDays(today, -int(0, 2))
  return {
    id: `task-${i + 1}`,
    title: room ? `${t.title} ${room.number}` : t.title,
    description: `${t.title}${room ? ` for room ${room.number}` : ''}. Priority handling required.`,
    assignedTo: member.id,
    staffMember: member,
    roomId: room?.id,
    priority: pick(['low', 'medium', 'high', 'urgent'] as const),
    status: pick(['pending', 'pending', 'in-progress', 'completed'] as const),
    category: t.category,
    createdAt: iso(created),
    dueAt: iso(addDays(created, int(0, 1))),
    completedAt: undefined,
  }
})

// ============================================================
// REVENUE — 365 days of daily revenue (drives 30d + 12mo views)
// ============================================================
export const dailyRevenue: RevenueData[] = Array.from({ length: 365 }, (_, i) => {
  const date = addDays(today, -(364 - i))
  const dow = date.getDay()
  const weekendBoost = dow === 5 || dow === 6 ? 1.35 : 1
  const seasonal = 1 + 0.25 * Math.sin((i / 365) * Math.PI * 2)
  const noise = 0.85 + rng() * 0.3
  const base = 78000 * weekendBoost * seasonal * noise
  const roomsRev = Math.round(base * 0.62)
  const fnb = Math.round(base * 0.18)
  const spa = Math.round(base * 0.08)
  const events = Math.round(base * 0.09)
  const other = Math.round(base * 0.03)
  return {
    date: iso(date),
    rooms: roomsRev,
    fnb,
    spa,
    events,
    other,
    total: roomsRev + fnb + spa + events + other,
  }
})

export const revenue30d = dailyRevenue.slice(-30)

// 12 monthly buckets for analytics
export const monthlyRevenue: RevenueData[] = (() => {
  const months: Record<string, RevenueData> = {}
  for (const d of dailyRevenue) {
    const key = d.date.slice(0, 7)
    if (!months[key]) {
      months[key] = { date: `${key}-01T00:00:00.000Z`, rooms: 0, fnb: 0, spa: 0, events: 0, other: 0, total: 0 }
    }
    months[key].rooms += d.rooms
    months[key].fnb += d.fnb
    months[key].spa += d.spa
    months[key].events += d.events
    months[key].other += d.other
    months[key].total += d.total
  }
  return Object.values(months)
})()

// ============================================================
// OCCUPANCY — last 30 days
// ============================================================
export const occupancy30d: OccupancyData[] = revenue30d.map((r) => {
  const rate = Math.round((0.62 + rng() * 0.33) * 100)
  const occ = Math.round((rate / 100) * 280)
  return {
    date: r.date,
    occupancyRate: rate,
    roomsOccupied: occ,
    roomsAvailable: 280 - occ,
    revpar: Math.round(r.rooms / 280),
    adr: Math.round(r.rooms / occ),
  }
})

// ============================================================
// KPI METRICS (live snapshot — derived from rooms/bookings)
// ============================================================
const occupiedNow = rooms.filter((r) => r.status === 'occupied').length
const activeGuestsNow = bookings.filter((b) => b.status === 'checked-in').length
const pendingTasksNow = tasks.filter((t) => t.status === 'pending' || t.status === 'in-progress').length
const todayRev = revenue30d[revenue30d.length - 1]

export const kpiMetrics: KPIMetrics = {
  revenueToday: todayRev.total,
  revenueGrowth: 12.4,
  occupancyRate: Math.round((occupiedNow / 280) * 100),
  occupancyGrowth: 4.8,
  activeGuests: activeGuestsNow,
  pendingTasks: pendingTasksNow,
  revpar: Math.round(todayRev.rooms / 280),
  adr: Math.round(todayRev.rooms / Math.max(occupiedNow, 1)),
  goppar: Math.round((todayRev.total * 0.42) / 280),
  avgStayLength: 3.4,
  guestSatisfaction: 94,
}

// Sparkline series for KPI cards (last 14 points)
export const sparklines = {
  revenue: dailyRevenue.slice(-14).map((d) => ({ v: d.total })),
  occupancy: occupancy30d.slice(-14).map((d) => ({ v: d.occupancyRate })),
  guests: occupancy30d.slice(-14).map((d) => ({ v: d.roomsOccupied })),
  tasks: Array.from({ length: 14 }, () => ({ v: int(8, 24) })),
}

// ============================================================
// NOTIFICATIONS
// ============================================================
const notificationSeeds: Array<Pick<Notification, 'type' | 'title' | 'message' | 'priority'>> = [
  { type: 'booking', title: 'New Booking', message: 'Aarav Sharma booked Suite 802 for 4 nights', priority: 'normal' },
  { type: 'checkin', title: 'VIP Arrival', message: 'Platinum guest Olivia Brown checking in at 3 PM', priority: 'high' },
  { type: 'maintenance', title: 'Maintenance Alert', message: 'AC reported faulty in room 415', priority: 'high' },
  { type: 'payment', title: 'Payment Received', message: '$2,840 settled for booking LG-20260042', priority: 'normal' },
  { type: 'message', title: 'Concierge Request', message: 'Room 1002 requests a dinner reservation', priority: 'low' },
  { type: 'checkout', title: 'Late Checkout', message: 'Room 305 extended checkout to 2 PM', priority: 'low' },
]

export const notifications: Notification[] = notificationSeeds.map((n, i) => ({
  ...n,
  id: `notif-${i + 1}`,
  isRead: i > 2,
  createdAt: iso(new Date(NOW.getTime() - int(5, 320) * 60000)),
}))

// ============================================================
// LIVE ACTIVITY FEED (simulated stream)
// ============================================================
export interface ActivityItem {
  id: string
  staffName: string
  staffAvatar: string
  action: string
  target: string
  type: 'checkin' | 'checkout' | 'cleaning' | 'maintenance' | 'order' | 'booking' | 'alert'
  timestamp: string
}

const activityTemplates: Array<{ action: string; type: ActivityItem['type']; target: () => string }> = [
  { action: 'checked in guest to', type: 'checkin', target: () => `Room ${pick(rooms).number}` },
  { action: 'completed cleaning of', type: 'cleaning', target: () => `Room ${pick(rooms).number}` },
  { action: 'checked out', type: 'checkout', target: () => `Room ${pick(rooms).number}` },
  { action: 'resolved maintenance in', type: 'maintenance', target: () => `Room ${pick(rooms).number}` },
  { action: 'delivered room service to', type: 'order', target: () => `Room ${pick(rooms).number}` },
  { action: 'confirmed booking', type: 'booking', target: () => `LG-${int(20260001, 20260120)}` },
  { action: 'flagged an alert in', type: 'alert', target: () => `Room ${pick(rooms).number}` },
]

export function generateActivity(count = 12): ActivityItem[] {
  return Array.from({ length: count }, (_, i) => {
    const member = pick(staff)
    const t = pick(activityTemplates)
    return {
      id: `act-${Date.now()}-${i}`,
      staffName: member.name,
      staffAvatar: member.avatar!,
      action: t.action,
      target: t.target(),
      type: t.type,
      timestamp: iso(new Date(NOW.getTime() - i * int(40, 200) * 1000)),
    }
  })
}

export const activityFeed = generateActivity(14)

// ============================================================
// RESTAURANT
// ============================================================
export const restaurantTables: RestaurantTable[] = Array.from({ length: 24 }, (_, i) => ({
  id: `table-${i + 1}`,
  number: i + 1,
  capacity: pick([2, 2, 4, 4, 6, 8]),
  status: pick(['available', 'occupied', 'occupied', 'reserved', 'cleaning'] as const),
  reservedFor: chance(0.3) ? pick(guests).name : undefined,
  reservedAt: chance(0.3) ? iso(addDays(today, 0)) : undefined,
}))

export const menuItems: MenuItem[] = [
  { name: 'Lobster Thermidor', category: 'Mains', price: 68, calories: 540, prep: 25 },
  { name: 'Wagyu Ribeye', category: 'Mains', price: 95, calories: 720, prep: 30 },
  { name: 'Truffle Risotto', category: 'Mains', price: 42, calories: 480, prep: 22 },
  { name: 'Pan-seared Foie Gras', category: 'Starters', price: 38, calories: 310, prep: 15 },
  { name: 'Burrata & Heirloom', category: 'Starters', price: 26, calories: 280, prep: 10 },
  { name: 'Tuna Tartare', category: 'Starters', price: 32, calories: 240, prep: 12 },
  { name: 'Saffron Bouillabaisse', category: 'Soups', price: 34, calories: 360, prep: 20 },
  { name: 'Dark Chocolate Soufflé', category: 'Desserts', price: 22, calories: 420, prep: 18 },
  { name: 'Crème Brûlée', category: 'Desserts', price: 18, calories: 350, prep: 8 },
  { name: 'Vintage Champagne', category: 'Beverages', price: 120, calories: 90, prep: 3 },
  { name: 'Single Malt Flight', category: 'Beverages', price: 85, calories: 210, prep: 5 },
  { name: 'Fresh Pressed Juice', category: 'Beverages', price: 14, calories: 110, prep: 4 },
].map((m, i) => ({
  id: `menu-${i + 1}`,
  name: m.name,
  description: 'Chef’s signature preparation with seasonal ingredients.',
  category: m.category,
  price: m.price,
  available: chance(0.85),
  preparationTime: m.prep,
  calories: m.calories,
  tags: pickN(['Signature', 'Chef Special', 'Seasonal', 'Gluten-free', 'Vegetarian'], int(1, 2)),
}))

// ============================================================
// EVENTS
// ============================================================
const eventTitles = [
  'Sharma–Patel Wedding', 'TechCorp Annual Gala', 'Diwali Charity Ball',
  'Global Finance Summit', 'Art & Wine Soirée', 'New Year Masquerade',
]
export const hotelEvents: HotelEvent[] = eventTitles.map((title, i) => {
  const start = addDays(today, int(-3, 40))
  return {
    id: `event-${i + 1}`,
    title,
    description: 'A signature Luxe Grand event hosted in our grand ballroom.',
    venueId: `venue-${int(1, 4)}`,
    hostName: `${pick(firstNames)} ${pick(lastNames)}`,
    startDate: iso(start),
    endDate: iso(addDays(start, int(0, 2))),
    guestCount: int(40, 400),
    status: pick(['tentative', 'confirmed', 'confirmed', 'in-progress', 'completed'] as const),
    totalValue: int(15000, 180000),
    includes: pickN(['Catering', 'Decor', 'AV & Lighting', 'Valet', 'Photography', 'Live Band'], int(2, 4)),
    assignedManager: pick(staff.filter((s) => s.department === 'management')).name,
  }
})

// ---------- Helpers exposed for UI ----------
export const getGuestById = (id: string) => guests.find((g) => g.id === id)
export const getRoomById = (id: string) => rooms.find((r) => r.id === id)
export const getStaffById = (id: string) => staff.find((s) => s.id === id)
