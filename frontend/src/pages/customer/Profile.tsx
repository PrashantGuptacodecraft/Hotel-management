import { motion } from 'framer-motion'
import { Crown, Mail, Phone, Globe, Star } from 'lucide-react'
import { useMyProfile } from '@/hooks/useApi'
import { Skeleton } from '@components/ui/Skeleton'
import { cn } from '@utils/cn'

const TIERS = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']
const tierColor: Record<string, string> = {
  BRONZE: 'text-amber-600',
  SILVER: 'text-slate-300',
  GOLD: 'text-gold-400',
  PLATINUM: 'text-electric-400',
}
const tierThreshold: Record<string, number> = { BRONZE: 0, SILVER: 2000, GOLD: 5000, PLATINUM: 12000 }

interface Profile {
  name: string
  email: string
  phone: string
  nationality: string
  avatar?: string
  loyaltyTier: string
  loyaltyPoints: number
  totalStays: number
  totalSpend: number
}

export default function ProfilePage() {
  const { data, isLoading } = useMyProfile()
  const profile = data as Profile | undefined

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <div className="grid gap-6 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    )
  }
  if (!profile) return <p className="text-white/60">Profile unavailable.</p>

  const tierIndex = TIERS.indexOf(profile.loyaltyTier)
  const nextTier = TIERS[tierIndex + 1]
  const progress = nextTier
    ? Math.min(100, Math.round((profile.loyaltyPoints / tierThreshold[nextTier]) * 100))
    : 100

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-white">My Profile</h1>

      {/* Identity + loyalty */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <img
            src={profile.avatar ?? `https://i.pravatar.cc/150?u=${profile.email}`}
            alt=""
            className="h-20 w-20 rounded-2xl border border-gold-500/30 object-cover"
          />
          <div className="flex-1">
            <h2 className="font-display text-2xl text-white">{profile.name}</h2>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/50">
              <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {profile.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {profile.phone || '—'}</span>
              <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> {profile.nationality}</span>
            </div>
          </div>
          <div className={cn('flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2', tierColor[profile.loyaltyTier])}>
            <Crown className="h-5 w-5" />
            <span className="font-display text-lg">{profile.loyaltyTier}</span>
          </div>
        </div>

        {/* Loyalty progress */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-white/55">{profile.loyaltyPoints.toLocaleString()} points</span>
            {nextTier ? (
              <span className="text-white/40">{tierThreshold[nextTier].toLocaleString()} for {nextTier}</span>
            ) : (
              <span className="text-electric-400">Top tier reached 🎉</span>
            )}
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gold-gradient"
            />
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        {[
          { label: 'Total Stays', value: profile.totalStays, icon: Star },
          { label: 'Total Spend', value: `$${profile.totalSpend.toLocaleString()}`, icon: Crown },
          { label: 'Loyalty Points', value: profile.loyaltyPoints.toLocaleString(), icon: Star },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="glass-card p-5"
          >
            <s.icon className="h-5 w-5 text-gold-400" />
            <p className="mt-3 font-mono text-2xl font-bold text-white">{s.value}</p>
            <p className="text-sm text-white/45">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
