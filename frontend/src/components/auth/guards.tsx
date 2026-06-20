import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth, isStaff } from '@/store/auth'

function Splash() {
  return (
    <div className="grid min-h-screen place-items-center bg-navy-900">
      <div className="flex flex-col items-center gap-4">
        <div className="grid h-14 w-14 animate-pulse place-items-center rounded-2xl bg-gold-gradient">
          <span className="font-display text-xl font-bold text-navy-900">LG</span>
        </div>
        <p className="text-sm text-white/40">Loading Luxe Grand…</p>
      </div>
    </div>
  )
}

/** Any authenticated user. */
export function RequireAuth() {
  const { user, status } = useAuth()
  const location = useLocation()
  if (status === 'idle' || status === 'loading') return <Splash />
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return <Outlet />
}

/** Staff/admin only — customers are bounced to their account area. */
export function RequireStaff() {
  const { user, status } = useAuth()
  if (status === 'idle' || status === 'loading') return <Splash />
  if (!user) return <Navigate to="/login" replace />
  if (!isStaff(user)) return <Navigate to="/account" replace />
  return <Outlet />
}

/** Public-only routes (login/register): redirect signed-in users away. */
export function PublicOnly() {
  const { user, status } = useAuth()
  if (status === 'idle' || status === 'loading') return <Splash />
  if (user) return <Navigate to={isStaff(user) ? '/admin/dashboard' : '/account'} replace />
  return <Outlet />
}
