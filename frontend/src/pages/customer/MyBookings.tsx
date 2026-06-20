import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BedDouble, CalendarDays, MapPin, X } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { useMyBookings, useCancelBooking } from '@/hooks/useApi'
import { formatCurrency } from '@utils/format'
import { apiError } from '@/lib/api'
import { Skeleton } from '@components/ui/Skeleton'
import { EmptyState } from '@components/ui/EmptyState'
import { cn } from '@utils/cn'

const statusStyle: Record<string, string> = {
  PENDING: 'bg-warning/10 text-warning',
  CONFIRMED: 'bg-success/10 text-success',
  CHECKED_IN: 'bg-electric-500/10 text-electric-500',
  CHECKED_OUT: 'bg-white/10 text-white/60',
  CANCELLED: 'bg-danger/10 text-danger',
  NO_SHOW: 'bg-danger/10 text-danger',
}

export default function MyBookings() {
  const { data: bookings, isLoading } = useMyBookings()
  const cancel = useCancelBooking()

  const onCancel = async (id: string) => {
    try {
      await cancel.mutateAsync(id)
      toast.success('Booking cancelled')
    } catch (err) {
      toast.error(apiError(err))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-white">My Bookings</h1>
        <p className="mt-1 text-sm text-white/45">Your reservations at Luxe Grand</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : !bookings || bookings.length === 0 ? (
        <EmptyState
          icon={BedDouble}
          title="No bookings yet"
          description="When you reserve a room, it'll appear here."
          action={
            <Link to="/" className="rounded-xl bg-gold-gradient px-5 py-2.5 text-sm font-semibold text-navy-900">
              Browse rooms
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((b, i) => {
            const canCancel = b.status === 'PENDING' || b.status === 'CONFIRMED'
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
              >
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gold-500/10">
                  <BedDouble className="h-6 w-6 text-gold-400" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-lg text-white">Room {b.room?.number}</h3>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', statusStyle[b.status] ?? 'bg-white/10 text-white/60')}>
                      {b.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/45">
                    <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {format(new Date(b.checkIn), 'MMM d')} → {format(new Date(b.checkOut), 'MMM d, yyyy')}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {b.room?.type}</span>
                    <span className="font-mono">#{b.bookingNumber}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-mono text-lg font-bold text-gold-400">{formatCurrency(b.totalAmount)}</p>
                    <p className="text-[10px] text-white/40">{b.nights} night{b.nights > 1 ? 's' : ''}</p>
                  </div>
                  {canCancel && (
                    <button
                      onClick={() => onCancel(b.id)}
                      disabled={cancel.isPending}
                      className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/55 transition-colors hover:border-danger/40 hover:text-danger disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" /> Cancel
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
