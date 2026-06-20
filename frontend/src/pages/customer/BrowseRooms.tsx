import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Users, BedDouble, Wifi, Sparkles, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { useAvailableRooms, type Room } from '@/hooks/useApi'
import { formatCurrency } from '@utils/format'
import { Skeleton } from '@components/ui/Skeleton'
import { EmptyState } from '@components/ui/EmptyState'
import { cn } from '@utils/cn'

const ROOM_TYPES = ['', 'STANDARD', 'DELUXE', 'SUITE', 'PRESIDENTIAL', 'PENTHOUSE']
const iso = (d: Date) => format(d, 'yyyy-MM-dd')
const tomorrow = new Date(Date.now() + 86_400_000)
const in3 = new Date(Date.now() + 3 * 86_400_000)

function RoomCard({ room, onBook }: { room: Room; onBook: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-card group flex flex-col overflow-hidden transition-shadow hover:shadow-card-hover"
    >
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-navy-600 to-navy-800">
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <BedDouble className="h-20 w-20 text-gold-400" />
        </div>
        <div className="absolute left-3 top-3 rounded-full bg-navy-900/70 px-3 py-1 text-xs font-medium text-gold-400 backdrop-blur">
          {room.type}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-navy-900/70 px-3 py-1 text-xs capitalize text-white/80 backdrop-blur">
          {room.view} view
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg text-white">Room {room.number}</h3>
            <p className="flex items-center gap-1 text-xs text-white/45">
              <Users className="h-3 w-3" /> Up to {room.capacity} guests · Floor {room.floor}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xl font-bold text-gold-400">{formatCurrency(room.dynamicPrice)}</p>
            <p className="text-[10px] text-white/40">per night</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {room.amenities.slice(0, 4).map((a) => (
            <span key={a} className="flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-1 text-[10px] text-white/55">
              <Wifi className="h-2.5 w-2.5" /> {a}
            </span>
          ))}
        </div>

        <button
          onClick={onBook}
          className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-gold-gradient py-2.5 text-sm font-semibold text-navy-900 transition-shadow hover:shadow-gold"
        >
          Book this room <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

export default function BrowseRooms() {
  const navigate = useNavigate()
  const [checkIn, setCheckIn] = useState(iso(tomorrow))
  const [checkOut, setCheckOut] = useState(iso(in3))
  const [adults, setAdults] = useState(2)
  const [type, setType] = useState('')
  const [search, setSearch] = useState<{ checkIn: string; checkOut: string; type?: string; capacity?: number } | null>({
    checkIn: iso(tomorrow),
    checkOut: iso(in3),
    capacity: 2,
  })

  const { data: rooms, isLoading, isError, refetch } = useAvailableRooms(search)

  const nights = useMemo(() => {
    const d = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000
    return Math.max(0, Math.round(d))
  }, [checkIn, checkOut])

  const onSearch = () => {
    if (nights < 1) return
    setSearch({ checkIn, checkOut, type: type || undefined, capacity: adults })
  }

  const book = (room: Room) => {
    const q = new URLSearchParams({ checkIn, checkOut, adults: String(adults) })
    navigate(`/book/${room.id}?${q.toString()}`)
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-navy-700 to-navy-800 p-8 md:p-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="text-sm text-gold-400">A 5-star experience awaits</p>
          <h1 className="mt-1 font-display text-3xl text-white md:text-4xl">Reserve your perfect stay</h1>
          <p className="mt-2 text-sm text-white/55">
            280 rooms across 10 floors — from elegant standards to the presidential penthouse.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mt-8 grid grid-cols-1 gap-3 rounded-2xl border border-white/[0.08] bg-navy-900/50 p-4 backdrop-blur md:grid-cols-5">
          <div>
            <label className="mb-1 block text-[11px] text-white/45">Check-in</label>
            <input type="date" value={checkIn} min={iso(new Date())} onChange={(e) => setCheckIn(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-gold-500/40 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-white/45">Check-out</label>
            <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-gold-500/40 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-white/45">Guests</label>
            <select value={adults} onChange={(e) => setAdults(Number(e.target.value))} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-gold-500/40 focus:outline-none">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n} className="bg-navy-800">{n} guest{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-white/45">Room type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-gold-500/40 focus:outline-none">
              {ROOM_TYPES.map((t) => (
                <option key={t} value={t} className="bg-navy-800">{t === '' ? 'Any type' : t}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={onSearch} className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold-gradient py-2 text-sm font-semibold text-navy-900">
              <Search className="h-4 w-4" /> Search
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-white">
            {search ? `Available rooms` : 'Search to see availability'}
            {nights > 0 && <span className="ml-2 text-sm text-white/40">· {nights} night{nights > 1 ? 's' : ''}</span>}
          </h2>
          {rooms && <span className="text-sm text-white/45">{rooms.length} rooms</span>}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
          </div>
        ) : isError ? (
          <EmptyState icon={Sparkles} title="Couldn't load rooms" description="Please try again." action={<button onClick={() => refetch()} className="rounded-lg bg-gold-gradient px-4 py-2 text-sm font-semibold text-navy-900">Retry</button>} />
        ) : !rooms || rooms.length === 0 ? (
          <EmptyState icon={BedDouble} title="No rooms available" description="Try different dates or room type." />
        ) : (
          <div className={cn('grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3')}>
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} onBook={() => book(room)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
