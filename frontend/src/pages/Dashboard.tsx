import { motion } from 'framer-motion'
import { DollarSign, BedDouble, Users, ClipboardList } from 'lucide-react'
import { KpiCard } from '@components/dashboard/KpiCard'
import { OccupancyHeatmap } from '@components/dashboard/OccupancyHeatmap'
import { RevenueChart } from '@components/dashboard/RevenueChart'
import { TodayTimeline } from '@components/dashboard/TodayTimeline'
import { ActivityFeed } from '@components/dashboard/ActivityFeed'
import { QuickActions } from '@components/dashboard/QuickActions'
import { useDashboard, useRooms } from '@/hooks/useApi'
import { useAuth } from '@/store/auth'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
}

const empty = [{ v: 0 }, { v: 0 }]

export default function Dashboard() {
  const { data, isLoading } = useDashboard()
  const { data: rooms, isLoading: roomsLoading } = useRooms()
  const user = useAuth((s) => s.user)

  const k = data?.kpis
  const loading = isLoading || !data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-gold-400">Welcome back, {user?.name?.split(' ')[0] ?? 'there'}</p>
          <h1 className="font-display text-3xl text-white">Operations Dashboard</h1>
        </div>
        <QuickActions />
      </div>

      {/* KPI cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
      >
        <motion.div variants={item}>
          <KpiCard
            label="Revenue Today"
            value={k?.revenueToday ?? 0}
            prefix="$"
            trend={k?.revenueGrowth ?? 0}
            icon={DollarSign}
            accent="gold"
            sparkline={data?.sparklines.revenue ?? empty}
            loading={loading}
          />
        </motion.div>
        <motion.div variants={item}>
          <KpiCard
            label="Occupancy Rate"
            value={k?.occupancyRate ?? 0}
            suffix="%"
            trend={k?.occupancyGrowth ?? 0}
            icon={BedDouble}
            accent="electric"
            sparkline={data?.sparklines.occupancy ?? empty}
            loading={loading}
          />
        </motion.div>
        <motion.div variants={item}>
          <KpiCard
            label="Active Guests"
            value={k?.activeGuests ?? 0}
            trend={6.2}
            icon={Users}
            accent="success"
            sparkline={data?.sparklines.guests ?? empty}
            loading={loading}
          />
        </motion.div>
        <motion.div variants={item}>
          <KpiCard
            label="Pending Tasks"
            value={k?.pendingTasks ?? 0}
            trend={-3.1}
            icon={ClipboardList}
            accent="warning"
            sparkline={data?.sparklines.tasks ?? empty}
            loading={loading}
          />
        </motion.div>
      </motion.div>

      {/* Heatmap + Timeline */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <OccupancyHeatmap rooms={rooms} loading={roomsLoading} />
        </div>
        <div>
          <TodayTimeline arrivals={data?.arrivals} departures={data?.departures} loading={loading} />
        </div>
      </div>

      {/* Revenue chart + Activity feed */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart revenue={data?.revenue30d} loading={loading} />
        </div>
        <div>
          <ActivityFeed loading={loading} />
        </div>
      </div>
    </div>
  )
}
