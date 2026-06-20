import { motion } from 'framer-motion'
import { Plus, LogIn, LogOut, BellRing, type LucideIcon } from 'lucide-react'
import toast from 'react-hot-toast'

interface Action {
  label: string
  icon: LucideIcon
  onClick: () => void
  primary?: boolean
}

export function QuickActions() {
  const actions: Action[] = [
    { label: 'New Booking', icon: Plus, primary: true, onClick: () => toast.success('New booking form opening…') },
    { label: 'Check In', icon: LogIn, onClick: () => toast.success('Check-in flow started') },
    { label: 'Check Out', icon: LogOut, onClick: () => toast.success('Check-out flow started') },
    { label: 'Send Alert', icon: BellRing, onClick: () => toast('Alert broadcast composer', { icon: '📣' }) },
  ]

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((a, i) => (
        <motion.button
          key={a.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={a.onClick}
          className={
            a.primary
              ? 'flex items-center gap-2 rounded-xl bg-gold-gradient px-4 py-2.5 text-sm font-semibold text-navy-900 shadow-gold transition-shadow hover:shadow-glow-gold'
              : 'flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/75 transition-colors hover:border-gold-500/30 hover:text-white'
          }
        >
          <a.icon className="h-4 w-4" />
          {a.label}
        </motion.button>
      ))}
    </div>
  )
}
