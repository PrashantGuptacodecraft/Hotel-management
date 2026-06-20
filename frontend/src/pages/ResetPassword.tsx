import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { AuthShell, fieldWrap, inputCls, submitCls } from '@components/auth/AuthShell'
import { api, apiError } from '@/lib/api'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      toast.success('Password updated — please sign in')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(apiError(err))
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthShell title="Invalid link">
        <p className="text-center text-sm text-white/60">This reset link is missing its token.</p>
        <div className="mt-6 text-center">
          <Link to="/forgot-password" className="text-sm text-gold-400 hover:text-gold-300">
            Request a new link
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Set a new password">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className={fieldWrap}>
          <Lock className="h-4 w-4 text-white/40" />
          <input
            type={showPw ? 'text' : 'password'}
            className={inputCls}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="button" onClick={() => setShowPw((s) => !s)} className="text-white/40 hover:text-white">
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-white/35">
          At least 8 characters with an uppercase letter, a lowercase letter, and a number.
        </p>
        <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} className={submitCls}>
          {loading ? 'Updating…' : (<>Update password <ArrowRight className="h-4 w-4" /></>)}
        </motion.button>
      </form>
    </AuthShell>
  )
}
