import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, LogOut } from 'lucide-react'
import { navItems } from './navConfig'
import { cn } from '@utils/cn'
import { useAuth } from '@/store/auth'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const titleCase = (s: string) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : 'Staff')

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const currentUser = {
    name: user?.name ?? 'Staff',
    role: titleCase(user?.role ?? ''),
    avatar: user?.avatar ?? `https://i.pravatar.cc/150?u=${user?.id ?? 'staff'}`,
  }

  const onLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 84 : 264 }}
      transition={{ type: 'spring', stiffness: 280, damping: 30 }}
      className="relative z-30 flex h-screen flex-col border-r border-white/[0.06] bg-navy-800/80 backdrop-blur-xl"
    >
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 px-5">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold-gradient shadow-glow-gold">
          <span className="font-display text-lg font-bold text-navy-900">LG</span>
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="whitespace-nowrap font-display text-lg leading-tight text-white">Luxe Grand</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold-400">Hotel Suite</p>
          </motion.div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[72px] z-40 grid h-6 w-6 place-items-center rounded-full border border-white/10 bg-navy-700 text-white/60 transition-colors hover:text-gold-400"
        aria-label="Toggle sidebar"
      >
        <ChevronLeft className={cn('h-3.5 w-3.5 transition-transform', collapsed && 'rotate-180')} />
      </button>

      {/* Nav */}
      <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="block focus:outline-none"
            title={collapsed ? item.label : undefined}
          >
            {({ isActive }) => (
              <div
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
                  isActive ? 'text-white' : 'text-white/55 hover:text-white'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-xl border border-gold-500/30 bg-gradient-to-r from-gold-500/15 to-transparent"
                  />
                )}
                {isActive && (
                  <motion.div
                    layoutId="active-bar"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gold-400 shadow-glow-gold"
                  />
                )}
                <item.icon
                  className={cn(
                    'relative z-10 h-5 w-5 shrink-0 transition-colors',
                    isActive ? 'text-gold-400' : 'text-current'
                  )}
                />
                {!collapsed && (
                  <span className="relative z-10 whitespace-nowrap text-sm font-medium">{item.label}</span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile + logout */}
      <div className="border-t border-white/[0.06] p-3">
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-2.5',
            collapsed && 'justify-center border-transparent bg-transparent p-0'
          )}
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="h-9 w-9 shrink-0 rounded-full border border-gold-500/30 object-cover"
          />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{currentUser.name}</p>
              <p className="truncate text-xs text-white/45">{currentUser.role}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={onLogout}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/45 transition-colors hover:bg-danger/10 hover:text-danger"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
