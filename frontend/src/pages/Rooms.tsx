import { useState } from 'react'
import { motion } from 'framer-motion'
import { BedDouble, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRooms, useUpdateRoom, type Room } from '@/hooks/useApi'
import { apiError } from '@/lib/api'
import { formatCurrency } from '@utils/format'
import { Skeleton } from '@components/ui/Skeleton'
import { EmptyState } from '@components/ui/EmptyState'
import { cn } from '@utils/cn'

const STATUSES = ['AVAILABLE', 'OCCUPIED', 'CLEANING', 'RESERVED', 'CHECKOUT', 'MAINTENANCE']
const TYPES = ['', 'STANDARD', 'DELUXE', 'SUITE', 'PRESIDENTIAL', 'PENTHOUSE']
const statusStyle: Record<string, string> = {
  AVAILABLE: 'bg-success/10 text-success',
  OCCUPIED: 'bg-electric-500/10 text-electric-500',
  CLEANING: 'bg-warning/10 text-warning',
  RESERVED: 'bg-gold-500/10 text-gold-400',
  CHECKOUT: 'bg-purple-500/10 text-purple-400',
  MAINTENANCE: 'bg-danger/10 text-danger',
}

export default function Rooms() {
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const { data: rooms, isLoading } = useRooms({
    status: statusFilter || undefined,
    type: typeFilter || undefined,
  })
  const update = useUpdateRoom()

  const changeStatus = async (room: Room, status: string) => {
    try {
      await update.mutateAsync({ id: room.id, status })
      toast.success(`Room ${room.number} → ${status.toLowerCase()}`)
    } catch (err) {
      toast.error(apiError(err))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-white">Rooms</h1>
          <p className="mt-1 text-sm text-white/45">{rooms?.length ?? 0} rooms · live status control</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
            <Filter className="h-4 w-4 text-white/40" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent text-sm text-white focus:outline-none">
              <option value="" className="bg-navy-800">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s} className="bg-navy-800">{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-transparent text-sm text-white focus:outline-none">
              {TYPES.map((t) => <option key={t} value={t} className="bg-navy-800">{t || 'All types'}</option>)}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 15 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : !rooms || rooms.length === 0 ? (
        <EmptyState icon={BedDouble} title="No rooms match" description="Adjust your filters." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {rooms.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.01, 0.3) }}
              className="glass-card p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-lg text-white">{room.number}</p>
                  <p className="text-[11px] text-white/40">{room.type} · F{room.floor}</p>
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', statusStyle[room.status])}>
                  {room.status}
                </span>
              </div>
              <p className="mt-3 font-mono text-sm text-gold-400">{formatCurrency(room.dynamicPrice)}<span className="text-[10px] text-white/35">/night</span></p>
              <select
                value={room.status}
                onChange={(e) => changeStatus(room, e.target.value)}
                disabled={update.isPending}
                className="mt-3 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1.5 text-xs text-white/80 focus:border-gold-500/40 focus:outline-none"
              >
                {STATUSES.map((s) => <option key={s} value={s} className="bg-navy-800">{s}</option>)}
              </select>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
