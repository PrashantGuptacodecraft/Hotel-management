import { motion } from 'framer-motion'
import { UserCog, Mail } from 'lucide-react'
import { useStaff } from '@/hooks/useApi'
import { Skeleton } from '@components/ui/Skeleton'
import { EmptyState } from '@components/ui/EmptyState'
import { cn } from '@utils/cn'

const roleStyle: Record<string, string> = {
  ADMIN: 'bg-danger/10 text-danger',
  MANAGER: 'bg-gold-500/10 text-gold-400',
  RECEPTIONIST: 'bg-electric-500/10 text-electric-500',
  HOUSEKEEPING: 'bg-warning/10 text-warning',
  CONCIERGE: 'bg-success/10 text-success',
  CHEF: 'bg-purple-500/10 text-purple-400',
  SECURITY: 'bg-white/10 text-white/60',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Staff = any

export default function Staff() {
  const { data: staff, isLoading } = useStaff()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-white">Staff</h1>
        <p className="mt-1 text-sm text-white/45">{staff?.length ?? 0} team members across all departments</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : !staff || staff.length === 0 ? (
        <EmptyState icon={UserCog} title="No staff yet" description="Add team members to get started." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((s: Staff, i: number) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.4) }}
              className="glass-card flex items-center gap-4 p-5"
            >
              <div className="relative">
                <img src={s.avatar} alt="" className="h-14 w-14 rounded-xl border border-white/10 object-cover" />
                {s.isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-navy-700 bg-success" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{s.name}</p>
                <p className="flex items-center gap-1 truncate text-[11px] text-white/40">
                  <Mail className="h-3 w-3" /> {s.email}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', roleStyle[s.role] ?? 'bg-white/10 text-white/60')}>
                    {s.role}
                  </span>
                  {s.department && <span className="text-[10px] text-white/35">{s.department}</span>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
