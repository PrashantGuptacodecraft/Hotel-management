import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth, isStaff } from '@/store/auth'
import { cn } from '@utils/cn'

export default function CustomerLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const onLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-gold-500/[0.05] blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-electric-500/[0.04] blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-navy-900/70 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-6 py-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold-gradient shadow-glow-gold">
              <span className="font-display text-base font-bold text-navy-900">LG</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-display text-base leading-tight text-white">Luxe Grand</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold-400">Reservations</p>
            </div>
          </Link>

          <nav className="ml-4 flex items-center gap-1">
            {[
              { to: '/', label: 'Browse', end: true },
              { to: '/account', label: 'My Bookings', end: false },
              { to: '/account/profile', label: 'Profile', end: false },
            ].map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'text-gold-400' : 'text-white/55 hover:text-white'
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {isStaff(user) && (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/70 hover:text-gold-400"
              >
                <LayoutDashboard className="h-3.5 w-3.5" /> Admin
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-[11px] text-white/40">{user.email}</p>
                </div>
                <img
                  src={user.avatar ?? `https://i.pravatar.cc/150?u=${user.id}`}
                  alt=""
                  className="h-9 w-9 rounded-full border border-gold-500/30 object-cover"
                />
                <button
                  onClick={onLogout}
                  className="grid h-9 w-9 place-items-center rounded-lg text-white/45 hover:bg-danger/10 hover:text-danger"
                  aria-label="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="rounded-lg px-3 py-2 text-sm text-white/70 hover:text-white">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-gold-gradient px-4 py-2 text-sm font-semibold text-navy-900"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative mx-auto max-w-7xl px-6 py-8"
      >
        <Outlet />
      </motion.main>
    </div>
  )
}
