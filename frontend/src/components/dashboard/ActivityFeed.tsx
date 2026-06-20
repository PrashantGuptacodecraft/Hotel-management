import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { SprayCan, Wrench, CalendarCheck, Bell, type LucideIcon } from 'lucide-react'
import { connectSocket } from '@/lib/socket'
import { useNotifications } from '@/hooks/useApi'
import { Skeleton } from '@components/ui/Skeleton'
import { cn } from '@utils/cn'

interface ActivityItem {
  id: string
  text: string
  type: 'booking' | 'room' | 'task' | 'alert'
  timestamp: string
}

const typeMeta: Record<ActivityItem['type'], { icon: LucideIcon; color: string }> = {
  booking: { icon: CalendarCheck, color: 'text-electric-500 bg-electric-500/10' },
  room: { icon: SprayCan, color: 'text-warning bg-warning/10' },
  task: { icon: Wrench, color: 'text-gold-400 bg-gold-500/10' },
  alert: { icon: Bell, color: 'text-danger bg-danger/10' },
}

let counter = 0
const nextId = () => `act-${Date.now()}-${counter++}`

export function ActivityFeed({ loading }: { loading?: boolean }) {
  const { data: notifications, isLoading } = useNotifications()
  const [items, setItems] = useState<ActivityItem[]>([])

  // Seed from recent notifications.
  useEffect(() => {
    if (notifications) {
      setItems(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        notifications.slice(0, 12).map((n: any) => ({
          id: n.id,
          text: n.message,
          type: (['booking', 'checkin', 'checkout'].includes(n.type) ? 'booking' : n.type === 'maintenance' ? 'task' : 'alert') as ActivityItem['type'],
          timestamp: n.createdAt,
        }))
      )
    }
  }, [notifications])

  // Live updates via socket.
  useEffect(() => {
    const socket = connectSocket()
    const prepend = (text: string, type: ActivityItem['type']) =>
      setItems((prev) => [{ id: nextId(), text, type, timestamp: new Date().toISOString() }, ...prev].slice(0, 25))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onBooking = (b: any) => prepend(`New booking · Room ${b.room?.number ?? ''} for ${b.guest?.name ?? 'a guest'}`, 'booking')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onBookingUpd = (b: any) => prepend(`Booking ${b.bookingNumber ?? ''} → ${String(b.status).replace('_', ' ').toLowerCase()}`, 'booking')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onRoom = (r: any) => prepend(`Room ${r.number} marked ${String(r.status).toLowerCase()}`, 'room')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onTask = (t: any) => prepend(`Task “${t.title}” → ${String(t.status).replace('_', ' ').toLowerCase()}`, 'task')

    socket.on('booking-created', onBooking)
    socket.on('booking-updated', onBookingUpd)
    socket.on('room-updated', onRoom)
    socket.on('task-updated', onTask)
    return () => {
      socket.off('booking-created', onBooking)
      socket.off('booking-updated', onBookingUpd)
      socket.off('room-updated', onRoom)
      socket.off('task-updated', onTask)
    }
  }, [])

  if (loading || isLoading) {
    return (
      <div className="glass-card p-6">
        <Skeleton className="h-5 w-32" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card flex flex-col p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-white">Live Activity</h3>
        <span className="flex items-center gap-1.5 text-xs text-success">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          Live
        </span>
      </div>

      <div className="mt-4 max-h-[420px] space-y-1 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const meta = typeMeta[item.type]
            const Icon = meta.icon
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/[0.03]"
              >
                <div className={cn('mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg', meta.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-white/80">{item.text}</p>
                  <p className="font-mono text-[10px] text-white/30">
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
