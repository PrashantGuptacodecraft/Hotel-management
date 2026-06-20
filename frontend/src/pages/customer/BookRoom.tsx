import { useMemo, useState } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, CreditCard, BedDouble, CalendarDays, Users, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { useRoom, useCreateCustomerBooking } from '@/hooks/useApi'
import { useAuth } from '@/store/auth'
import { ADDONS, TAX_RATE } from '@/lib/addons'
import { formatCurrency } from '@utils/format'
import { apiError } from '@/lib/api'
import { Skeleton } from '@components/ui/Skeleton'
import { cn } from '@utils/cn'

export default function BookRoom() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: room, isLoading } = useRoom(id ?? null)
  const createBooking = useCreateCustomerBooking()

  const checkIn = params.get('checkIn') ?? format(new Date(Date.now() + 86_400_000), 'yyyy-MM-dd')
  const checkOut = params.get('checkOut') ?? format(new Date(Date.now() + 3 * 86_400_000), 'yyyy-MM-dd')
  const adults = Number(params.get('adults') ?? 2)

  const [selected, setSelected] = useState<Record<string, number>>({})
  const [requests, setRequests] = useState('')

  const nights = Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000))

  const pricing = useMemo(() => {
    const roomTotal = (room?.dynamicPrice ?? 0) * nights
    const addonsTotal = Object.entries(selected).reduce((s, [key, qty]) => {
      const a = ADDONS.find((x) => x.key === key)
      return s + (a ? a.price * qty : 0)
    }, 0)
    const subtotal = roomTotal + addonsTotal
    const tax = Math.round(subtotal * TAX_RATE)
    return { roomTotal, addonsTotal, subtotal, tax, total: subtotal + tax }
  }, [room, nights, selected])

  const toggleAddon = (key: string) =>
    setSelected((s) => {
      const next = { ...s }
      if (next[key]) delete next[key]
      else next[key] = 1
      return next
    })

  const confirm = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/book/${id}?${params.toString()}` } })
      return
    }
    try {
      await createBooking.mutateAsync({
        roomId: id,
        checkIn,
        checkOut,
        adults,
        children: 0,
        specialRequests: requests || undefined,
        addons: Object.entries(selected).map(([key, quantity]) => ({ key, quantity })),
      })
      toast.success('Booking confirmed! A confirmation email is on its way.')
      navigate('/account', { replace: true })
    } catch (err) {
      toast.error(apiError(err))
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 lg:col-span-2" />
        <Skeleton className="h-96" />
      </div>
    )
  }
  if (!room) {
    return <p className="text-white/60">Room not found.</p>
  }

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-gold-400">
        <ArrowLeft className="h-4 w-4" /> Back to rooms
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Details */}
        <div className="space-y-6 lg:col-span-2">
          <div className="glass-card overflow-hidden">
            <div className="relative h-52 bg-gradient-to-br from-navy-600 to-navy-800">
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <BedDouble className="h-28 w-28 text-gold-400" />
              </div>
              <div className="absolute left-4 top-4 rounded-full bg-navy-900/70 px-3 py-1 text-xs text-gold-400 backdrop-blur">
                {room.type}
              </div>
            </div>
            <div className="p-6">
              <h1 className="font-display text-2xl text-white">Room {room.number}</h1>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-white/50">
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> Up to {room.capacity} guests</span>
                <span className="capitalize">{room.view} view</span>
                <span>Floor {room.floor}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {room.amenities.map((a) => (
                  <span key={a} className="rounded-md bg-white/[0.04] px-2.5 py-1 text-xs text-white/60">{a}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Add-ons */}
          <div className="glass-card p-6">
            <h2 className="font-display text-lg text-white">Enhance your stay</h2>
            <p className="text-xs text-white/45">Optional extras</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ADDONS.map((a) => {
                const active = !!selected[a.key]
                return (
                  <button
                    key={a.key}
                    onClick={() => toggleAddon(a.key)}
                    className={cn(
                      'flex items-center justify-between rounded-xl border p-3 text-left transition-colors',
                      active ? 'border-gold-500/40 bg-gold-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15'
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{a.name}</p>
                      <p className="text-xs text-white/45">{formatCurrency(a.price)}</p>
                    </div>
                    <span className={cn('grid h-5 w-5 place-items-center rounded-md border', active ? 'border-gold-400 bg-gold-400 text-navy-900' : 'border-white/20')}>
                      {active && <Check className="h-3.5 w-3.5" />}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-5">
              <label className="mb-1.5 block text-xs text-white/55">Special requests</label>
              <textarea
                value={requests}
                onChange={(e) => setRequests(e.target.value)}
                rows={3}
                placeholder="Anniversary, early check-in, dietary needs…"
                className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-sm text-white placeholder:text-white/30 focus:border-gold-500/40 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Summary / payment */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <h2 className="font-display text-lg text-white">Booking summary</h2>

            <div className="mt-4 space-y-3 border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <CalendarDays className="h-4 w-4 text-gold-400" />
                {format(new Date(checkIn), 'MMM d')} → {format(new Date(checkOut), 'MMM d, yyyy')}
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Users className="h-4 w-4 text-gold-400" /> {adults} guest{adults > 1 ? 's' : ''} · {nights} night{nights > 1 ? 's' : ''}
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <Row label={`${formatCurrency(room.dynamicPrice)} × ${nights} nights`} value={formatCurrency(pricing.roomTotal)} />
              {pricing.addonsTotal > 0 && <Row label="Add-ons" value={formatCurrency(pricing.addonsTotal)} />}
              <Row label="Taxes & fees (12%)" value={formatCurrency(pricing.tax)} muted />
              <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
                <span className="font-medium text-white">Total</span>
                <span className="font-mono text-xl font-bold text-gold-400">{formatCurrency(pricing.total)}</span>
              </div>
            </div>

            <button
              onClick={confirm}
              disabled={createBooking.isPending}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gold-gradient py-3 text-sm font-semibold text-navy-900 shadow-gold transition-shadow hover:shadow-glow-gold disabled:opacity-70"
            >
              {createBooking.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
              ) : user ? (
                <><CreditCard className="h-4 w-4" /> Pay &amp; Confirm</>
              ) : (
                'Sign in to book'
              )}
            </button>
            <p className="mt-3 text-center text-[11px] text-white/35">
              Simulated secure payment · no real card charged
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? 'text-white/40' : 'text-white/60'}>{label}</span>
      <span className="font-mono text-white/80">{value}</span>
    </div>
  )
}
