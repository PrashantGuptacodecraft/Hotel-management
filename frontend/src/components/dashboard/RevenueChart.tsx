import { useMemo } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { format } from 'date-fns'
import { formatCurrency } from '@utils/format'
import { Skeleton } from '@components/ui/Skeleton'

export interface RevenuePoint {
  date: string
  rooms: number
  fnb: number
  spa: number
  events: number
  other: number
  total: number
}

interface ChartPoint {
  date: string
  label: string
  total: number
  rooms: number
  forecast: number | null
  actual: number | null
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: ChartPoint }[] }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="rounded-xl border border-white/10 bg-navy-700/95 p-3 shadow-card backdrop-blur-xl">
      <p className="mb-1 font-mono text-xs text-white/50">{p.label}</p>
      <p className="font-display text-base text-gold-400">{formatCurrency(p.total)}</p>
      <p className="text-xs text-white/45">Rooms · {formatCurrency(p.rooms)}</p>
    </div>
  )
}

export function RevenueChart({ revenue, loading }: { revenue?: RevenuePoint[]; loading?: boolean }) {
  const source = revenue ?? []
  const data: ChartPoint[] = useMemo(() => {
    const splitIndex = source.length - 7 // last 7 days become forecast overlay
    return source.map((d, i) => {
      const isForecast = i >= splitIndex - 1
      return {
        date: d.date,
        label: format(new Date(d.date), 'MMM d'),
        total: d.total,
        rooms: d.rooms,
        actual: i < splitIndex ? d.total : i === splitIndex - 1 ? d.total : null,
        forecast: isForecast ? Math.round(d.total * (1 + (i - splitIndex) * 0.012)) : null,
      }
    })
  }, [source])

  if (loading || !revenue) {
    return (
      <div className="glass-card p-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg text-white">Revenue Performance</h3>
          <p className="text-xs text-white/45">Last 30 days · with 7-day forecast</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-white/55">
            <span className="h-2.5 w-2.5 rounded-sm bg-electric-500" /> Actual
          </span>
          <span className="flex items-center gap-1.5 text-white/55">
            <span className="h-0 w-4 border-t-2 border-dashed border-gold-400" /> Forecast
          </span>
        </div>
      </div>

      <div className="mt-5 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00D4FF" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#00D4FF" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatCurrency(v, 'USD', true)}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Legend wrapperStyle={{ display: 'none' }} />
            <Bar dataKey="actual" name="Actual" fill="url(#barGrad)" radius={[4, 4, 0, 0]} maxBarSize={18} />
            <Line
              type="monotone"
              dataKey="forecast"
              name="Forecast"
              stroke="#D4AF37"
              strokeWidth={2.5}
              strokeDasharray="6 5"
              dot={false}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
