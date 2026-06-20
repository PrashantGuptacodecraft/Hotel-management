import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Room } from '@/hooks/useApi'
import { Skeleton } from '@components/ui/Skeleton'
import { cn } from '@utils/cn'

const statusColor: Record<string, string> = {
  AVAILABLE: 'bg-success/70 hover:bg-success',
  OCCUPIED: 'bg-electric-500/70 hover:bg-electric-500',
  CLEANING: 'bg-warning/70 hover:bg-warning',
  MAINTENANCE: 'bg-danger/70 hover:bg-danger',
  RESERVED: 'bg-gold-500/70 hover:bg-gold-500',
  CHECKOUT: 'bg-purple-500/70 hover:bg-purple-500',
}

const legend: { status: string; label: string; dot: string }[] = [
  { status: 'AVAILABLE', label: 'Available', dot: 'bg-success' },
  { status: 'OCCUPIED', label: 'Occupied', dot: 'bg-electric-500' },
  { status: 'CLEANING', label: 'Cleaning', dot: 'bg-warning' },
  { status: 'RESERVED', label: 'Reserved', dot: 'bg-gold-500' },
  { status: 'CHECKOUT', label: 'Checkout', dot: 'bg-purple-500' },
  { status: 'MAINTENANCE', label: 'Maintenance', dot: 'bg-danger' },
]

const floors = Array.from({ length: 10 }, (_, i) => 10 - i)

export function OccupancyHeatmap({ rooms, loading }: { rooms?: Room[]; loading?: boolean }) {
  const [hovered, setHovered] = useState<Room | null>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  if (loading || !rooms) {
    return (
      <div className="glass-card p-6">
        <Skeleton className="h-5 w-48" />
        <div className="mt-6 space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </div>
    )
  }

  const counts = legend.map((l) => ({ ...l, n: rooms.filter((r) => r.status === l.status).length }))

  return (
    <div className="glass-card relative p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-white">Room Occupancy</h3>
          <p className="text-xs text-white/45">{rooms.length} rooms · 10 floors · live status</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {counts.map((l) => (
            <div key={l.status} className="flex items-center gap-1.5">
              <span className={cn('h-2.5 w-2.5 rounded-sm', l.dot)} />
              <span className="text-xs text-white/55">{l.label}</span>
              <span className="font-mono text-xs text-white/35">{l.n}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-1.5">
        {floors.map((floor, fi) => {
          const floorRooms = rooms.filter((r) => r.floor === floor)
          return (
            <div key={floor} className="flex items-center gap-3">
              <span className="w-8 shrink-0 text-right font-mono text-[11px] text-white/35">F{floor}</span>
              <div className="grid flex-1 grid-cols-[repeat(28,minmax(0,1fr))] gap-1">
                {floorRooms.map((room, ri) => (
                  <motion.button
                    key={room.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: fi * 0.02 + ri * 0.004, duration: 0.2 }}
                    onMouseEnter={(e) => {
                      setHovered(room)
                      setPos({ x: e.clientX, y: e.clientY })
                    }}
                    onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
                    onMouseLeave={() => setHovered(null)}
                    className={cn(
                      'aspect-square rounded-[3px] transition-all duration-150 hover:scale-125 hover:ring-2 hover:ring-white/40',
                      statusColor[room.status] ?? 'bg-white/20'
                    )}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {hovered && (
        <div
          className="pointer-events-none fixed z-50 w-44 rounded-xl border border-white/10 bg-navy-700/95 p-3 shadow-card backdrop-blur-xl"
          style={{ left: Math.min(pos.x + 14, window.innerWidth - 190), top: pos.y + 14 }}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm font-bold text-white">Room {hovered.number}</span>
            <span className="text-[11px] capitalize text-gold-400">{hovered.type.toLowerCase()}</span>
          </div>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-white/40">Status</span>
              <span className="capitalize text-white/80">{hovered.status.toLowerCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Rate</span>
              <span className="font-mono text-white/80">${hovered.dynamicPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">View</span>
              <span className="capitalize text-white/80">{hovered.view}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
