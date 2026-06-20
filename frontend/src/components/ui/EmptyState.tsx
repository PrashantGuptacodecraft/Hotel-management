import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@utils/cn'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

/** Friendly empty state with a glowing icon halo. */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('flex flex-col items-center justify-center py-16 text-center', className)}
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-gold-500/20 blur-2xl" />
        <div className="relative grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/5">
          <Icon className="h-7 w-7 text-gold-400" />
        </div>
      </div>
      <h3 className="font-display text-lg text-white">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-white/50">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}
