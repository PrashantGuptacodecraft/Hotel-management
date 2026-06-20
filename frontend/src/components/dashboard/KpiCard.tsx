import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'
import { Skeleton } from '@components/ui/Skeleton'
import { cn } from '@utils/cn'

export interface KpiCardProps {
  label: string
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  trend: number
  icon: LucideIcon
  accent: 'gold' | 'electric' | 'success' | 'warning'
  sparkline: { v: number }[]
  loading?: boolean
}

const accentMap = {
  gold: { text: 'text-gold-400', stroke: '#D4AF37', glow: 'shadow-gold', bg: 'bg-gold-500/10' },
  electric: { text: 'text-electric-500', stroke: '#00D4FF', glow: 'shadow-electric', bg: 'bg-electric-500/10' },
  success: { text: 'text-success', stroke: '#00E5A0', glow: 'shadow-[0_0_30px_rgba(0,229,160,0.15)]', bg: 'bg-success/10' },
  warning: { text: 'text-warning', stroke: '#FF9500', glow: 'shadow-[0_0_30px_rgba(255,149,0,0.15)]', bg: 'bg-warning/10' },
}

export function KpiCard({
  label, value, prefix, suffix, decimals = 0, trend, icon: Icon, accent, sparkline, loading,
}: KpiCardProps) {
  const a = accentMap[accent]
  const up = trend >= 0
  const gradId = `kpi-grad-${label.replace(/\s/g, '')}`

  if (loading) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-5 w-14" />
        </div>
        <Skeleton className="mt-5 h-8 w-32" />
        <Skeleton className="mt-2 h-3 w-24" />
      </div>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn('glass-card group relative overflow-hidden p-5 transition-shadow hover:shadow-card-hover')}
    >
      {/* Sparkline backdrop */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 opacity-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkline} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={a.stroke} stopOpacity={0.4} />
                <stop offset="100%" stopColor={a.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={a.stroke} strokeWidth={2} fill={`url(#${gradId})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className={cn('grid h-10 w-10 place-items-center rounded-xl', a.bg)}>
            <Icon className={cn('h-5 w-5', a.text)} />
          </div>
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
              up ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
            )}
          >
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </div>
        </div>

        <div className="mt-4 font-mono text-3xl font-bold tracking-tight text-white font-number">
          {prefix}
          <CountUp end={value} duration={1.6} separator="," decimals={decimals} />
          {suffix}
        </div>
        <p className="mt-1 text-sm text-white/45">{label}</p>
      </div>
    </motion.div>
  )
}
