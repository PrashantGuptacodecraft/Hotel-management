import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, Command } from 'lucide-react'
import { format } from 'date-fns'
import { useNotifications } from '@/hooks/useApi'
import { cn } from '@utils/cn'

interface TopbarProps {
  onOpenPalette: () => void
}

const priorityDot: Record<string, string> = {
  high: 'bg-danger',
  normal: 'bg-electric-500',
  low: 'bg-white/30',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Notification = any

export default function Topbar({ onOpenPalette }: TopbarProps) {
  const [now, setNow] = useState(new Date())
  const [showNotifs, setShowNotifs] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const { data } = useNotifications()
  const notifications: Notification[] = data ?? []
  const unread = notifications.filter((n) => !n.isRead).length

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-white/[0.06] bg-navy-900/70 px-6 backdrop-blur-xl">
      {/* Search trigger */}
      <button
        onClick={onOpenPalette}
        className="group flex h-11 flex-1 max-w-md items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 text-left transition-colors hover:border-gold-500/30"
      >
        <Search className="h-4 w-4 text-white/40 group-hover:text-gold-400" />
        <span className="flex-1 text-sm text-white/35">Search anything…</span>
        <span className="flex items-center gap-1 rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-white/40">
          <Command className="h-3 w-3" /> K
        </span>
      </button>

      <div className="flex-1" />

      {/* Date / time */}
      <div className="hidden text-right md:block">
        <p className="font-mono text-sm font-medium text-white">{format(now, 'h:mm:ss a')}</p>
        <p className="text-xs text-white/45">{format(now, 'EEEE, MMM d')}</p>
      </div>

      <div className="h-8 w-px bg-white/10" />

      {/* Notifications */}
      <div ref={notifRef} className="relative">
        <button
          onClick={() => setShowNotifs((s) => !s)}
          className="relative grid h-11 w-11 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-white/60 transition-colors hover:border-gold-500/30 hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-danger text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </button>

        <AnimatePresence>
          {showNotifs && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="absolute right-0 top-14 w-80 overflow-hidden rounded-2xl border border-white/10 bg-navy-700/95 shadow-card backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <p className="font-display text-sm text-white">Notifications</p>
                <span className="rounded-full bg-gold-500/15 px-2 py-0.5 text-[11px] text-gold-400">{unread} new</span>
              </div>
              <div className="max-h-96 divide-y divide-white/[0.04] overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      'flex gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]',
                      !n.isRead && 'bg-gold-500/[0.04]'
                    )}
                  >
                    <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', priorityDot[n.priority])} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">{n.title}</p>
                      <p className="text-xs text-white/50">{n.message}</p>
                      <p className="mt-1 font-mono text-[10px] text-white/30">
                        {format(new Date(n.createdAt), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
