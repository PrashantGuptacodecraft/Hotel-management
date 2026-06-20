import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogIn, LogOut, ArrowRight, CalendarClock } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { useUpdateBookingStatus } from '@/hooks/useApi'
import { apiError } from '@/lib/api'
import { Skeleton } from '@components/ui/Skeleton'
import { EmptyState } from '@components/ui/EmptyState'
import { cn } from '@utils/cn'

type Tab = 'arrivals' | 'departures'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Booking = any

function Row({ booking, kind, onAction, busy }: { booking: Booking; kind: Tab; onAction: (b: Booking) => void; busy: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 transition-colors hover:border-white/10"
    >
      <img src={booking.guest?.avatar} alt="" className="h-10 w-10 rounded-full border border-white/10 object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{booking.guest?.name}</p>
        <p className="text-xs text-white/45">
          Room {booking.room?.number} · {booking.nights}N · {booking.adults + booking.children} guests
        </p>
      </div>
      <div className="text-right">
        <p className="font-mono text-xs text-white/60">
          {format(new Date(kind === 'arrivals' ? booking.checkIn : booking.checkOut), 'h:mm a')}
        </p>
        <p className="text-[10px] capitalize text-gold-400">{booking.guest?.loyaltyTier?.toLowerCase()}</p>
      </div>
      <button
        onClick={() => onAction(booking)}
        disabled={busy}
        className={cn(
          'flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50',
          kind === 'arrivals'
            ? 'bg-success/10 text-success hover:bg-success/20'
            : 'bg-electric-500/10 text-electric-500 hover:bg-electric-500/20'
        )}
      >
        {kind === 'arrivals' ? <LogIn className="h-3.5 w-3.5" /> : <LogOut className="h-3.5 w-3.5" />}
        {kind === 'arrivals' ? 'Check In' : 'Check Out'}
      </button>
    </motion.div>
  )
}

export function TodayTimeline({
  arrivals,
  departures,
  loading,
}: {
  arrivals?: Booking[]
  departures?: Booking[]
  loading?: boolean
}) {
  const [tab, setTab] = useState<Tab>('arrivals')
  const updateStatus = useUpdateBookingStatus()

  if (loading || !arrivals || !departures) {
    return (
      <div className="glass-card p-6">
        <Skeleton className="h-5 w-36" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  const list = tab === 'arrivals' ? arrivals : departures
  const onAction = async (b: Booking) => {
    try {
      await updateStatus.mutateAsync({ id: b.id, status: tab === 'arrivals' ? 'CHECKED_IN' : 'CHECKED_OUT' })
      toast.success(`${tab === 'arrivals' ? 'Checked in' : 'Checked out'} ${b.guest?.name ?? 'guest'}`)
    } catch (err) {
      toast.error(apiError(err))
    }
  }

  return (
    <div className="glass-card flex flex-col p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-white">Today’s Timeline</h3>
        <div className="flex rounded-lg border border-white/[0.07] bg-white/[0.03] p-0.5">
          {(['arrivals', 'departures'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'relative rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                tab === t ? 'text-navy-900' : 'text-white/55 hover:text-white'
              )}
            >
              {tab === t && <motion.div layoutId="timeline-tab" className="absolute inset-0 rounded-md bg-gold-gradient" />}
              <span className="relative z-10">{t}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex-1 space-y-2.5">
        {list.length === 0 ? (
          <EmptyState icon={CalendarClock} title={`No ${tab} today`} description="The schedule is all clear." />
        ) : (
          list.map((b) => <Row key={b.id} booking={b} kind={tab} onAction={onAction} busy={updateStatus.isPending} />)
        )}
      </div>

      <button className="mt-4 flex items-center justify-center gap-1 rounded-xl border border-white/[0.06] py-2.5 text-xs font-medium text-white/55 transition-colors hover:border-gold-500/30 hover:text-gold-400">
        View full schedule <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
