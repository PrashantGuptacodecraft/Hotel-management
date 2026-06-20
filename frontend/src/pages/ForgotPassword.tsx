import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, MailCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { AuthShell, fieldWrap, inputCls, submitCls } from '@components/auth/AuthShell'
import { api, apiError } from '@/lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      toast.error(apiError(err))
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthShell title="Check your inbox">
        <div className="flex flex-col items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-success/10">
            <MailCheck className="h-7 w-7 text-success" />
          </div>
          <p className="mt-4 text-sm text-white/60">
            If an account exists for <span className="text-white">{email}</span>, a password reset link is on its way.
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
      title="Reset password"
      subtitle="We'll email you a reset link"
      footer={
        <Link to="/login" className="text-gold-400 hover:text-gold-300">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className={fieldWrap}>
          <Mail className="h-4 w-4 text-white/40" />
          <input type="email" className={inputCls} placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} className={submitCls}>
          {loading ? 'Sending…' : (<>Send reset link <ArrowRight className="h-4 w-4" /></>)}
        </motion.button>
      </form>
    </AuthShell>
  )
}
