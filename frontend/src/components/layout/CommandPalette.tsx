import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CornerDownLeft } from 'lucide-react'
import { navItems } from './navConfig'
import { cn } from '@utils/cn'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return navItems
    return navItems.filter((i) => i.label.toLowerCase().includes(q))
  }, [query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
    }
  }, [open])

  useEffect(() => {
    setActive(0)
  }, [query])

  const go = (path: string) => {
    navigate(path)
    onClose()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter' && results[active]) {
      go(results[active].path)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-navy-950/70 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-navy-700/95 shadow-card backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-4">
              <Search className="h-5 w-5 text-white/40" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search pages, guests, bookings…"
                className="w-full bg-transparent py-4 text-sm text-white placeholder:text-white/35 focus:outline-none"
              />
              <kbd className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-white/40">ESC</kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-white/40">No results for “{query}”</p>
              ) : (
                results.map((item, i) => (
                  <button
                    key={item.path}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(item.path)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                      i === active ? 'bg-gold-500/10 text-white' : 'text-white/60'
                    )}
                  >
                    <item.icon className={cn('h-4 w-4', i === active ? 'text-gold-400' : 'text-white/40')} />
                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                    {i === active && <CornerDownLeft className="h-3.5 w-3.5 text-white/30" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
