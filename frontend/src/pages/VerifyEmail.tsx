import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { AuthShell } from '@components/auth/AuthShell'
import { api, apiError } from '@/lib/api'

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [state, setState] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    if (!token) {
      setState('error')
      setMessage('No verification token provided.')
      return
    }
    api
      .post('/auth/verify-email', { token })
      .then((res) => {
        setState('success')
        setMessage(res.data.data.message)
      })
      .catch((err) => {
        setState('error')
        setMessage(apiError(err))
      })
  }, [token])

  return (
    <AuthShell title="Email verification">
      <div className="flex flex-col items-center text-center">
        {state === 'verifying' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-gold-400" />
            <p className="mt-4 text-sm text-white/60">Verifying your email…</p>
          </>
        )}
        {state === 'success' && (
          <>
            <CheckCircle2 className="h-14 w-14 text-success" />
            <p className="mt-4 text-sm text-white/70">{message}</p>
            <Link
              to="/login"
              className="mt-6 rounded-xl bg-gold-gradient px-6 py-2.5 text-sm font-semibold text-navy-900"
            >
              Sign in
            </Link>
          </>
        )}
        {state === 'error' && (
          <>
            <XCircle className="h-14 w-14 text-danger" />
            <p className="mt-4 text-sm text-white/70">{message}</p>
            <Link to="/login" className="mt-6 text-sm text-gold-400 hover:text-gold-300">
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </AuthShell>
  )
}
