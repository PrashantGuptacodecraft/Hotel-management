import { motion } from 'framer-motion'
import { Sparkles, type LucideIcon } from 'lucide-react'

interface PageStubProps {
  icon: LucideIcon
  title: string
  subtitle: string
  features: string[]
}

/**
 * Polished placeholder for pages that are next in the build queue.
 * Keeps routing/navigation fully functional while individual pages
 * are crafted one by one.
 */
export function PageStub({ icon: Icon, title, subtitle, features }: PageStubProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-white">{title}</h1>
        <p className="mt-1 text-sm text-white/45">{subtitle}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        className="glass-card relative overflow-hidden p-12"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="relative flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-3xl bg-gold-500/20 blur-2xl" />
            <div className="relative grid h-20 w-20 place-items-center rounded-3xl border border-gold-500/20 bg-gradient-to-br from-gold-500/15 to-transparent">
              <Icon className="h-9 w-9 text-gold-400" />
            </div>
          </div>

          <span className="mb-3 flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-medium text-gold-400">
            <Sparkles className="h-3.5 w-3.5" /> Crafting in progress
          </span>
          <h2 className="font-display text-2xl text-white">{title} is on the way</h2>
          <p className="mt-2 max-w-md text-sm text-white/50">
            This module is being hand-built to the same standard as the dashboard. Here’s what it will include:
          </p>

          <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
            {features.map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-left"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gold-500/10 font-mono text-xs text-gold-400">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-white/70">{f}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
