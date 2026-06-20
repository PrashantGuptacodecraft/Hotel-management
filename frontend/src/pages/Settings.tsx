import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User as UserIcon,
  Users,
  ServerCog,
  Lock,
  Plus,
  Trash2,
  Check,
  X,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  useStaff,
  useCreateStaff,
  useUpdateStaff,
  useDeleteStaff,
  useUpdateProfile,
  useChangePassword,
  useSystemStatus,
} from '@/hooks/useApi'
import { useAuth } from '@/store/auth'
import { apiError } from '@/lib/api'
import { Skeleton } from '@components/ui/Skeleton'
import { cn } from '@utils/cn'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any
type Tab = 'account' | 'team' | 'system'

const input =
  'w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-gold-500/40 focus:outline-none'

export default function Settings() {
  const user = useAuth((s) => s.user)
  const isAdmin = user?.role === 'ADMIN'
  const [tab, setTab] = useState<Tab>('account')

  const tabs: { key: Tab; label: string; icon: typeof UserIcon; show: boolean }[] = [
    { key: 'account', label: 'Account', icon: UserIcon, show: true },
    { key: 'team', label: 'Team', icon: Users, show: isAdmin },
    { key: 'system', label: 'System', icon: ServerCog, show: isAdmin || user?.role === 'MANAGER' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-white">Settings</h1>
        <p className="mt-1 text-sm text-white/45">Manage your account, team & integrations</p>
      </div>

      <div className="flex gap-2 border-b border-white/[0.06]">
        {tabs.filter((t) => t.show).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              tab === t.key ? 'border-gold-400 text-gold-400' : 'border-transparent text-white/50 hover:text-white'
            )}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'account' && <AccountTab />}
      {tab === 'team' && isAdmin && <TeamTab />}
      {tab === 'system' && <SystemTab />}
    </div>
  )
}

// ---------------- Account ----------------
function AccountTab() {
  const user = useAuth((s) => s.user)
  const setUser = useAuth((s) => s.setUser)
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()
  const logout = useAuth((s) => s.logout)

  const [name, setName] = useState(user?.name ?? '')
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' })

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const updated = await updateProfile.mutateAsync(name)
      setUser(updated)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(apiError(err))
    }
  }

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await changePassword.mutateAsync(pw)
      toast.success('Password changed — please sign in again')
      await logout()
    } catch (err) {
      toast.error(apiError(err))
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={saveProfile} className="glass-card p-6">
        <h3 className="font-display text-lg text-white">Profile</h3>
        <p className="text-xs text-white/45">Your display name across the platform</p>
        <div className="mt-5 flex items-center gap-4">
          <img src={user?.avatar ?? `https://i.pravatar.cc/100?u=${user?.id}`} alt="" className="h-16 w-16 rounded-2xl border border-gold-500/30 object-cover" />
          <div className="flex-1">
            <label className="mb-1 block text-xs text-white/55">Full name</label>
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
        </div>
        <p className="mt-3 text-xs text-white/40">Email: {user?.email} · Role: {user?.role}</p>
        <button type="submit" disabled={updateProfile.isPending} className="mt-5 rounded-xl bg-gold-gradient px-5 py-2.5 text-sm font-semibold text-navy-900 disabled:opacity-50">
          {updateProfile.isPending ? 'Saving…' : 'Save profile'}
        </button>
      </motion.form>

      <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} onSubmit={savePassword} className="glass-card p-6">
        <h3 className="flex items-center gap-2 font-display text-lg text-white"><Lock className="h-4 w-4 text-gold-400" /> Change password</h3>
        <p className="text-xs text-white/45">You'll be signed out after changing it</p>
        <div className="mt-5 space-y-3">
          <input type="password" className={input} placeholder="Current password" value={pw.currentPassword} onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))} required />
          <input type="password" className={input} placeholder="New password" value={pw.newPassword} onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))} required />
          <p className="text-[11px] text-white/35">Min 8 chars with uppercase, lowercase & a number.</p>
        </div>
        <button type="submit" disabled={changePassword.isPending} className="mt-5 rounded-xl border border-white/[0.08] px-5 py-2.5 text-sm font-semibold text-white/80 hover:border-gold-500/30 hover:text-gold-400 disabled:opacity-50">
          {changePassword.isPending ? 'Updating…' : 'Update password'}
        </button>
      </motion.form>
    </div>
  )
}

// ---------------- Team (admin) ----------------
const ROLES = ['MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING', 'CONCIERGE', 'CHEF', 'SECURITY']
const roleStyle: Record<string, string> = {
  ADMIN: 'bg-danger/10 text-danger',
  MANAGER: 'bg-gold-500/10 text-gold-400',
  RECEPTIONIST: 'bg-electric-500/10 text-electric-500',
  HOUSEKEEPING: 'bg-warning/10 text-warning',
  CONCIERGE: 'bg-success/10 text-success',
  CHEF: 'bg-purple-500/10 text-purple-400',
  SECURITY: 'bg-white/10 text-white/60',
}

function TeamTab() {
  const { data: staff, isLoading } = useStaff()
  const createStaff = useCreateStaff()
  const updateStaff = useUpdateStaff()
  const deleteStaff = useDeleteStaff()
  const me = useAuth((s) => s.user)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'RECEPTIONIST', department: 'Front Desk' })

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createStaff.mutateAsync(form)
      toast.success('Staff member added')
      setShowAdd(false)
      setForm({ name: '', email: '', password: '', role: 'RECEPTIONIST', department: 'Front Desk' })
    } catch (err) {
      toast.error(apiError(err))
    }
  }

  const changeRole = async (id: string, role: string) => {
    try {
      await updateStaff.mutateAsync({ id, role })
      toast.success('Role updated')
    } catch (err) {
      toast.error(apiError(err))
    }
  }

  const remove = async (id: string, name: string) => {
    if (!confirm(`Remove ${name}?`)) return
    try {
      await deleteStaff.mutateAsync(id)
      toast.success('Staff member removed')
    } catch (err) {
      toast.error(apiError(err))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowAdd((s) => !s)} className="flex items-center gap-2 rounded-xl bg-gold-gradient px-4 py-2.5 text-sm font-semibold text-navy-900">
          {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {showAdd ? 'Cancel' : 'Add staff'}
        </button>
      </div>

      {showAdd && (
        <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={add} className="glass-card grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-5">
          <input className={input} placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <input className={input} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
          <input className={input} type="password" placeholder="Temp password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
          <select className={input} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
            {ROLES.map((r) => <option key={r} value={r} className="bg-navy-800">{r}</option>)}
          </select>
          <button type="submit" disabled={createStaff.isPending} className="flex items-center justify-center gap-1 rounded-lg bg-gold-gradient px-4 py-2 text-sm font-semibold text-navy-900 disabled:opacity-50">
            <Check className="h-4 w-4" /> Add
          </button>
        </motion.form>
      )}

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-5">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wide text-white/40">
                <th className="px-5 py-3 font-medium">Member</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(staff ?? []).map((s: Any) => (
                <tr key={s.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <img src={s.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-white">{s.name}</p>
                        <p className="text-[11px] text-white/40">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {s.role === 'ADMIN' ? (
                      <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', roleStyle.ADMIN)}>ADMIN</span>
                    ) : (
                      <select value={s.role} onChange={(e) => changeRole(s.id, e.target.value)} className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-xs text-white/80 focus:outline-none">
                        {ROLES.map((r) => <option key={r} value={r} className="bg-navy-800">{r}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="px-5 py-3 text-white/55">{s.department ?? '—'}</td>
                  <td className="px-5 py-3 text-right">
                    {s.id !== me?.id && s.role !== 'ADMIN' && (
                      <button onClick={() => remove(s.id, s.name)} className="text-white/40 hover:text-danger">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ---------------- System ----------------
function SystemTab() {
  const { data, isLoading } = useSystemStatus()
  const status = data as Any

  if (isLoading || !status) {
    return <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
  }

  const integrations = Object.entries(status.integrations) as [string, Any][]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-display text-lg text-white">Integrations</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {integrations.map(([key, info]) => (
            <div key={key} className="glass-card flex items-center justify-between p-5">
              <div>
                <p className="font-medium capitalize text-white">{key}</p>
                <p className="text-xs text-white/45">{info.label}</p>
              </div>
              {info.configured ? <CheckCircle2 className="h-6 w-6 text-success" /> : <XCircle className="h-6 w-6 text-white/30" />}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-display text-lg text-white">Property</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Object.entries(status.stats).map(([key, value]) => (
            <div key={key} className="glass-card p-5">
              <p className="font-mono text-2xl font-bold text-white">{value as number}</p>
              <p className="text-sm capitalize text-white/45">{key}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
