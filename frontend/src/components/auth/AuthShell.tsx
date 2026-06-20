import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface AuthShellProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-900 px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-[32rem] w-[32rem] rounded-full bg-gold-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-[32rem] w-[32rem] rounded-full bg-electric-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/85 to-navy-900/50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-card p-8 shadow-card">
          <Link to="/" className="mb-8 flex flex-col items-center text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gold-gradient shadow-glow-gold">
              <span className="font-display text-2xl font-bold text-navy-900">LG</span>
            </div>
            <h1 className="mt-4 font-display text-2xl text-white">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-white/45">{subtitle}</p>}
          </Link>
          {children}
        </div>
        {footer && <div className="mt-5 text-center text-sm text-white/45">{footer}</div>}
      </motion.div>
    </div>
  )
}

export const fieldWrap =
  'flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 transition-colors focus-within:border-gold-500/40'
export const inputCls =
  'w-full bg-transparent py-3 text-sm text-white placeholder:text-white/30 focus:outline-none'
export const submitCls =
  'flex w-full items-center justify-center gap-2 rounded-xl bg-gold-gradient py-3 text-sm font-semibold text-navy-900 shadow-gold transition-shadow hover:shadow-glow-gold disabled:opacity-70'
