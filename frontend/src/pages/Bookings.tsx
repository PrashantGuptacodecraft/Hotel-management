import { useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarCheck, Check, LogIn, LogOut, X, Filter } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { useBookings, useUpdateBookingStatus } from '@/hooks/useApi'
import { apiError } from '@/lib/api'
import { formatCurrency } from '@utils/format'
import { Skeleton } from '@components/ui/Skeleton'
import { EmptyState } from '@components/ui/EmptyState'
import { cn } from '@utils/cn'

const STATUSES = ['', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW']
const statusStyle: Record<string, string> = {
  PENDING: 'bg-warning/10 text-warning',
  CONFIRMED: 'bg-success/10 text-success',
  CHECKED_IN: 'bg-electric-500/10 text-electric-500',
  CHECKED_OUT: 'bg-white/10 text-white/60',
  CANCELLED: 'bg-danger/10 text-danger',
  NO_SHOW: 'bg-danger/10 text-danger',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Booking = any

function Actions({ b, onAct, busy }: { b: Booking; onAct: (id: string, s: string) => void; busy: boolean }) {
  const btn = 'flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50'
  return (
    <div className="flex justify-end gap-1.5">
      {b.status === 'PENDING' && (
        <button disabled={busy} onClick={() => onAct(b.id, 'CONFIRMED')} className={cn(btn, 'bg-success/10 text-success hover:bg-success/20')}>
          <Check className="h-3.5 w-3.5" /> Confirm
        </button>
      )}
      {b.status === 'CONFIRMED' && (
        <button disabled={busy} onClick={() => onAct(b.id, 'CHECKED_IN')} className={cn(btn, 'bg-electric-500/10 text-electric-500 hover:bg-electric-500/20')}>
          <LogIn className="h-3.5 w-3.5" /> Check in
        </button>
      )}
      {b.status === 'CHECKED_IN' && (
        <button disabled={busy} onClick={() => onAct(b.id, 'CHECKED_OUT')} className={cn(btn, 'bg-gold-500/10 text-gold-400 hover:bg-gold-500/20')}>
          <LogOut className="h-3.5 w-3.5" /> Check out
        </button>
      )}
      {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
        <button disabled={busy} onClick={() => onAct(b.id, 'CANCELLED')} className={cn(btn, 'bg-danger/10 text-danger hover:bg-danger/20')}>
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export default function Bookings() {
  const [status, setStatus] = useState('')
  const { data: bookings, isLoading } = useBookings({ status: status || undefined, limit: 100 })
  const update = useUpdateBookingStatus()

  const onAct = async (id: string, s: string) => {
    try {
      await update.mutateAsync({ id, status: s })
      toast.success(`Booking ${s.replace('_', ' ').toLowerCase()}`)
    } catch (err) {
      toast.error(apiError(err))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-white">Bookings</h1>
          <p className="mt-1 text-sm text-white/45">Manage reservations across all channels</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
          <Filter className="h-4 w-4 text-white/40" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-transparent text-sm text-white focus:outline-none">
            {STATUSES.map((s) => (
              <option key={s} value={s} className="bg-navy-800">{s ? s.replace('_', ' ') : 'All statuses'}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : !bookings || bookings.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No bookings found" description="Try a different filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wide text-white/40">
                  <th className="px-5 py-3 font-medium">Guest</th>
                  <th className="px-5 py-3 font-medium">Room</th>
                  <th className="px-5 py-3 font-medium">Dates</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b: Booking, i: number) => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.02, 0.4) }}
                    className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <img src={b.guest?.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                        <div>
                          <p className="font-medium text-white">{b.guest?.name}</p>
                          <p className="font-mono text-[10px] text-white/35">{b.bookingNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-white/70">
                      {b.room?.number} <span className="text-white/35">· {b.room?.type}</span>
                    </td>
                    <td className="px-5 py-3 text-white/60">
                      {format(new Date(b.checkIn), 'MMM d')} → {format(new Date(b.checkOut), 'MMM d')}
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', statusStyle[b.status])}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-white/80">{formatCurrency(b.totalAmount)}</td>
                    <td className="px-5 py-3"><Actions b={b} onAct={onAct} busy={update.isPending} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
