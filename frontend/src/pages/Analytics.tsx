import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { format } from 'date-fns'
import { useAnalyticsOverview } from '@/hooks/useApi'
import { formatCurrency } from '@utils/format'
import { Skeleton } from '@components/ui/Skeleton'

interface Overview {
  series: { date: string; revpar: number; adr: number; occupancyRate: number; total: number }[]
  breakdown: { rooms: number; fnb: number; spa: number; events: number; other: number }
}

const DONUT = [
  { key: 'rooms', label: 'Rooms', color: '#D4AF37' },
  { key: 'fnb', label: 'F&B', color: '#00D4FF' },
  { key: 'spa', label: 'Spa', color: '#00E5A0' },
  { key: 'events', label: 'Events', color: '#FF9500' },
  { key: 'other', label: 'Other', color: '#7C5CFF' },
] as const

export default function Analytics() {
  const { data, isLoading } = useAnalyticsOverview()
  const overview = data as Overview | undefined

  if (isLoading || !overview) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  const trend = overview.series.filter((_, i) => i % 3 === 0).map((s) => ({ ...s, label: format(new Date(s.date), 'MMM d') }))
  const pie = DONUT.map((d) => ({ name: d.label, value: overview.breakdown[d.key], color: d.color }))
  const totalRev = pie.reduce((s, p) => s + p.value, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-white">Analytics</h1>
        <p className="mt-1 text-sm text-white/45">90-day revenue intelligence</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* RevPAR / ADR trend */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="font-display text-lg text-white">RevPAR &amp; ADR</h3>
          <p className="text-xs text-white/45">Revenue per available room vs average daily rate</p>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: '#141B2D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="revpar" name="RevPAR" stroke="#D4AF37" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="adr" name="ADR" stroke="#00D4FF" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue breakdown donut */}
        <div className="glass-card p-6">
          <h3 className="font-display text-lg text-white">Revenue Mix</h3>
          <p className="text-xs text-white/45">90-day breakdown</p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {pie.map((p) => <Cell key={p.name} fill={p.color} stroke="none" />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#141B2D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  formatter={(v: number) => formatCurrency(v)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {pie.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-white/60">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} /> {p.name}
                </span>
                <span className="font-mono text-white/70">{Math.round((p.value / totalRev) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
