import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PartyPopper, Plus, X, CalendarDays, Users, MapPin, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { useEvents, useVenues, useCreateEvent, useUpdateEvent } from '@/hooks/useApi'
import { apiError } from '@/lib/api'
import { formatCurrency } from '@utils/format'
import { Skeleton } from '@components/ui/Skeleton'
import { EmptyState } from '@components/ui/EmptyState'
import { cn } from '@utils/cn'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any

const PIPELINE = ['TENTATIVE', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] as const
const ALL_STATUSES = ['TENTATIVE', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
const statusColor: Record<string, string> = {
  TENTATIVE: 'bg-warning/10 text-warning',
  CONFIRMED: 'bg-success/10 text-success',
  IN_PROGRESS: 'bg-electric-500/10 text-electric-500',
  COMPLETED: 'bg-white/10 text-white/60',
  CANCELLED: 'bg-danger/10 text-danger',
}
const INCLUDE_OPTIONS = ['Catering', 'Decor', 'AV & Lighting', 'Valet', 'Photography', 'Live Band']

export default function Events() {
  const { data: events, isLoading } = useEvents()
  const update = useUpdateEvent()
  const [showCreate, setShowCreate] = useState(false)

  const setStatus = async (id: string, status: string) => {
    try {
      await update.mutateAsync({ id, status })
      toast.success(`Event → ${status.replace('_', ' ').toLowerCase()}`)
    } catch (e) {
      toast.error(apiError(e))
    }
  }

  const confirmedValue = (events ?? [])
    .filter((e: Any) => e.status === 'CONFIRMED' || e.status === 'IN_PROGRESS')
    .reduce((s: number, e: Any) => s + e.totalValue, 0)
  const upcoming = (events ?? []).filter((e: Any) => new Date(e.startDate) >= new Date()).length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-white">Events</h1>
          <p className="mt-1 text-sm text-white/45">Banquets, galas & private functions</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-gold-gradient px-4 py-2.5 text-sm font-semibold text-navy-900 shadow-gold"
        >
          <Plus className="h-4 w-4" /> New Event
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[
          { label: 'Total Events', value: events?.length ?? 0, icon: PartyPopper },
          { label: 'Confirmed Pipeline', value: formatCurrency(confirmedValue), icon: DollarSign },
          { label: 'Upcoming', value: upcoming, icon: CalendarDays },
        ].map((s) => (
          <div key={s.label} className="glass-card p-5">
            <s.icon className="h-5 w-5 text-gold-400" />
            <p className="mt-3 font-mono text-2xl font-bold text-white">{s.value}</p>
            <p className="text-sm text-white/45">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : !events?.length ? (
        <EmptyState
          icon={PartyPopper}
          title="No events yet"
          description="Create your first event to get started."
          action={
            <button onClick={() => setShowCreate(true)} className="rounded-xl bg-gold-gradient px-5 py-2.5 text-sm font-semibold text-navy-900">
              New Event
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-4">
          {PIPELINE.map((col) => {
            const colEvents = events.filter((e: Any) => e.status === col)
            const colValue = colEvents.reduce((s: number, e: Any) => s + e.totalValue, 0)
            return (
              <div key={col} className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', statusColor[col])}>
                    {col.replace('_', ' ')}
                  </span>
                  <span className="font-mono text-xs text-white/35">{colEvents.length}</span>
                </div>
                <p className="mb-3 px-1 font-mono text-xs text-white/40">{formatCurrency(colValue)}</p>
                <div className="space-y-3">
                  {colEvents.map((e: Any) => (
                    <motion.div key={e.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
                      <h4 className="font-medium text-white">{e.title}</h4>
                      <div className="mt-2 space-y-1 text-xs text-white/50">
                        <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {e.venue?.name}</p>
                        <p className="flex items-center gap-1.5"><CalendarDays className="h-3 w-3" /> {format(new Date(e.startDate), 'MMM d, yyyy')}</p>
                        <p className="flex items-center gap-1.5"><Users className="h-3 w-3" /> {e.guestCount} guests</p>
                      </div>
                      <p className="mt-2 font-mono text-sm font-bold text-gold-400">{formatCurrency(e.totalValue)}</p>
                      {e.includes?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {e.includes.slice(0, 3).map((inc: string) => (
                            <span key={inc} className="rounded bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-white/55">{inc}</span>
                          ))}
                        </div>
                      )}
                      <select
                        value={e.status}
                        onChange={(ev) => setStatus(e.id, ev.target.value)}
                        className="mt-3 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1.5 text-xs text-white/80 focus:border-gold-500/40 focus:outline-none"
                      >
                        {ALL_STATUSES.map((s) => <option key={s} value={s} className="bg-navy-800">{s.replace('_', ' ')}</option>)}
                      </select>
                    </motion.div>
                  ))}
                  {colEvents.length === 0 && <p className="px-1 py-4 text-center text-xs text-white/25">Empty</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AnimatePresence>{showCreate && <NewEventModal onClose={() => setShowCreate(false)} />}</AnimatePresence>
    </div>
  )
}

function NewEventModal({ onClose }: { onClose: () => void }) {
  const { data: venues } = useVenues()
  const create = useCreateEvent()
  const [form, setForm] = useState({
    title: '',
    venueId: '',
    hostName: '',
    startDate: format(new Date(Date.now() + 7 * 864e5), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 7 * 864e5), 'yyyy-MM-dd'),
    guestCount: 100,
    totalValue: 25000,
  })
  const [includes, setIncludes] = useState<string[]>(['Catering'])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.venueId) return toast.error('Please choose a venue')
    try {
      await create.mutateAsync({
        ...form,
        guestCount: Number(form.guestCount),
        totalValue: Number(form.totalValue),
        includes,
      })
      toast.success('Event created')
      onClose()
    } catch (err) {
      toast.error(apiError(err))
    }
  }

  const input = 'w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-gold-500/40 focus:outline-none'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-sm"
    >
      <motion.form
        initial={{ scale: 0.96, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-navy-700/95 p-6 backdrop-blur-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg text-white">New Event</h3>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-3">
          <input className={input} placeholder="Event title" value={form.title} onChange={set('title')} required />
          <div className="grid grid-cols-2 gap-3">
            <select className={input} value={form.venueId} onChange={set('venueId')} required>
              <option value="" className="bg-navy-800">Select venue…</option>
              {(venues ?? []).map((v: Any) => (
                <option key={v.id} value={v.id} className="bg-navy-800">{v.name} ({v.capacity})</option>
              ))}
            </select>
            <input className={input} placeholder="Host name" value={form.hostName} onChange={set('hostName')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] text-white/45">Start</label>
              <input type="date" className={input} value={form.startDate} onChange={set('startDate')} required />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-white/45">End</label>
              <input type="date" className={input} value={form.endDate} min={form.startDate} onChange={set('endDate')} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] text-white/45">Guests</label>
              <input type="number" min={1} className={input} value={form.guestCount} onChange={set('guestCount')} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-white/45">Value ($)</label>
              <input type="number" min={0} className={input} value={form.totalValue} onChange={set('totalValue')} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] text-white/45">Includes</label>
            <div className="flex flex-wrap gap-2">
              {INCLUDE_OPTIONS.map((opt) => {
                const active = includes.includes(opt)
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setIncludes((inc) => (active ? inc.filter((x) => x !== opt) : [...inc, opt]))}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs transition-colors',
                      active ? 'border-gold-500/40 bg-gold-500/10 text-gold-400' : 'border-white/[0.08] text-white/55'
                    )}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={create.isPending}
          className="mt-6 w-full rounded-xl bg-gold-gradient py-3 text-sm font-semibold text-navy-900 disabled:opacity-50"
        >
          {create.isPending ? 'Creating…' : 'Create Event'}
        </button>
      </motion.form>
    </motion.div>
  )
}
