import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, Crown } from 'lucide-react'
import { useGuests } from '@/hooks/useApi'
import { formatCurrency } from '@utils/format'
import { Skeleton } from '@components/ui/Skeleton'
import { EmptyState } from '@components/ui/EmptyState'
import { cn } from '@utils/cn'

const tierStyle: Record<string, string> = {
  BRONZE: 'bg-amber-700/15 text-amber-500',
  SILVER: 'bg-slate-400/15 text-slate-300',
  GOLD: 'bg-gold-500/15 text-gold-400',
  PLATINUM: 'bg-electric-500/15 text-electric-400',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Guest = any

export default function Guests() {
  const [search, setSearch] = useState('')
  const { data: guests, isLoading } = useGuests(search || undefined)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-white">Guests</h1>
          <p className="mt-1 text-sm text-white/45">Guest CRM · loyalty & lifetime value</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
          <Search className="h-4 w-4 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guests…"
            className="w-48 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : !guests || guests.length === 0 ? (
          <EmptyState icon={Users} title="No guests found" description="Try a different search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wide text-white/40">
                  <th className="px-5 py-3 font-medium">Guest</th>
                  <th className="px-5 py-3 font-medium">Tier</th>
                  <th className="px-5 py-3 text-right font-medium">Stays</th>
                  <th className="px-5 py-3 text-right font-medium">Total Spend</th>
                  <th className="px-5 py-3 text-right font-medium">Points</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((g: Guest, i: number) => (
                  <motion.tr
                    key={g.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.02, 0.4) }}
                    className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <img src={g.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                        <div>
                          <p className="flex items-center gap-1.5 font-medium text-white">
                            {g.name}
                            {g.isVIP && <Crown className="h-3 w-3 text-gold-400" />}
                          </p>
                          <p className="text-[11px] text-white/40">{g.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', tierStyle[g.loyaltyTier])}>
                        {g.loyaltyTier}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-white/70">{g.totalStays}</td>
                    <td className="px-5 py-3 text-right font-mono text-white/80">{formatCurrency(g.totalSpend)}</td>
                    <td className="px-5 py-3 text-right font-mono text-gold-400">{g.loyaltyPoints?.toLocaleString()}</td>
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
