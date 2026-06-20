import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, MailCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { AuthShell, fieldWrap, inputCls, submitCls } from '@components/auth/AuthShell'
import { useAuth } from '@/store/auth'
import { apiError } from '@/lib/api'

export default function Register() {
  const registerUser = useAuth((s) => s.register)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<string | null>(null)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await registerUser(form)
      setDone(res.email)
      toast.success('Account created — check your email to verify')
    } catch (err) {
      toast.error(apiError(err))
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <AuthShell title="Almost there" subtitle="Verify your email to continue">
        <div className="flex flex-col items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-success/10">
            <MailCheck className="h-7 w-7 text-success" />
          </div>
          <p className="mt-4 text-sm text-white/60">
            We sent a verification link to <span className="text-white">{done}</span>. Click it to activate your
            account, then sign in.
          </p>
          <Link to="/login" className="mt-6 text-sm text-gold-400 hover:text-gold-300">
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Create account"
      subtitle="Join Luxe Grand"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-gold-400 hover:text-gold-300">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className={fieldWrap}>
          <User className="h-4 w-4 text-white/40" />
          <input className={inputCls} placeholder="Full name" value={form.name} onChange={set('name')} required />
        </div>
        <div className={fieldWrap}>
          <Mail className="h-4 w-4 text-white/40" />
          <input type="email" className={inputCls} placeholder="Email" value={form.email} onChange={set('email')} required />
        </div>
        <div className={fieldWrap}>
          <Phone className="h-4 w-4 text-white/40" />
          <input className={inputCls} placeholder="Phone (optional)" value={form.phone} onChange={set('phone')} />
        </div>
        <div className={fieldWrap}>
          <Lock className="h-4 w-4 text-white/40" />
          <input
            type={showPw ? 'text' : 'password'}
            className={inputCls}
            placeholder="Password"
            value={form.password}
            onChange={set('password')}
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
          {loading ? 'Creating…' : (<>Create Account <ArrowRight className="h-4 w-4" /></>)}
        </motion.button>
      </form>
    </AuthShell>
  )
}
