import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { AuthShell, fieldWrap, inputCls, submitCls } from '@components/auth/AuthShell'
import { useAuth, isStaff } from '@/store/auth'
import { apiError } from '@/lib/api'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuth((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`)
      const from = (location.state as { from?: string })?.from
      navigate(from ?? (isStaff(user) ? '/admin/dashboard' : '/account'), { replace: true })
    } catch (err) {
      toast.error(apiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Luxe Grand"
      subtitle="Sign in to your account"
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="text-gold-400 hover:text-gold-300">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/55">Email</label>
          <div className={fieldWrap}>
            <Mail className="h-4 w-4 text-white/40" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="you@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/55">Password</label>
          <div className={fieldWrap}>
            <Lock className="h-4 w-4 text-white/40" />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="••••••••"
              required
            />
            <button type="button" onClick={() => setShowPw((s) => !s)} className="text-white/40 hover:text-white">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Link to="/forgot-password" className="text-sm text-gold-400 hover:text-gold-300">
            Forgot password?
          </Link>
        </div>

        <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} className={submitCls}>
          {loading ? 'Signing in…' : (<>Sign In <ArrowRight className="h-4 w-4" /></>)}
        </motion.button>
      </form>

      <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center text-xs text-white/40">
        Demo · admin@luxegrand.com / Admin@123 · customer@luxegrand.com / Customer@123
      </div>
    </AuthShell>
  )
}
