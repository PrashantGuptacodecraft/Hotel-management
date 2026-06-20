import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UtensilsCrossed, Users, Plus, X, Check, Minus, ChefHat } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  useTables,
  useMenu,
  useOrders,
  useUpdateTable,
  useUpdateMenuItem,
  useCreateOrder,
  useUpdateOrderStatus,
} from '@/hooks/useApi'
import { apiError } from '@/lib/api'
import { formatCurrency } from '@utils/format'
import { Skeleton } from '@components/ui/Skeleton'
import { EmptyState } from '@components/ui/EmptyState'
import { cn } from '@utils/cn'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any

type Tab = 'floor' | 'orders' | 'menu'

const tableColor: Record<string, string> = {
  AVAILABLE: 'border-success/40 bg-success/10 text-success',
  OCCUPIED: 'border-electric-500/40 bg-electric-500/10 text-electric-500',
  RESERVED: 'border-gold-500/40 bg-gold-500/10 text-gold-400',
  CLEANING: 'border-warning/40 bg-warning/10 text-warning',
}
const TABLE_STATUSES = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING']

const orderFlow: Record<string, string | null> = {
  PENDING: 'PREPARING',
  PREPARING: 'READY',
  READY: 'SERVED',
  SERVED: 'PAID',
  PAID: null,
  CANCELLED: null,
}
const orderColor: Record<string, string> = {
  PENDING: 'bg-warning/10 text-warning',
  PREPARING: 'bg-electric-500/10 text-electric-500',
  READY: 'bg-gold-500/10 text-gold-400',
  SERVED: 'bg-success/10 text-success',
  PAID: 'bg-white/10 text-white/60',
  CANCELLED: 'bg-danger/10 text-danger',
}

export default function Restaurant() {
  const [tab, setTab] = useState<Tab>('floor')
  const [orderTable, setOrderTable] = useState<Any | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-white">Restaurant</h1>
          <p className="mt-1 text-sm text-white/45">Floor plan, live orders & menu</p>
        </div>
        <div className="flex rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
          {(['floor', 'orders', 'menu'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'relative rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors',
                tab === t ? 'text-navy-900' : 'text-white/55 hover:text-white'
              )}
            >
              {tab === t && <motion.div layoutId="rest-tab" className="absolute inset-0 rounded-lg bg-gold-gradient" />}
              <span className="relative z-10">{t === 'floor' ? 'Floor Plan' : t}</span>
            </button>
          ))}
        </div>
      </div>

      {tab === 'floor' && <FloorPlan onNewOrder={(t) => setOrderTable(t)} />}
      {tab === 'orders' && <Orders />}
      {tab === 'menu' && <Menu />}

      <AnimatePresence>
        {orderTable && <NewOrderModal table={orderTable} onClose={() => setOrderTable(null)} />}
      </AnimatePresence>
    </div>
  )
}

// ---------------- Floor Plan ----------------
function FloorPlan({ onNewOrder }: { onNewOrder: (t: Any) => void }) {
  const { data: tables, isLoading } = useTables()
  const updateTable = useUpdateTable()
  const [selected, setSelected] = useState<Any | null>(null)

  if (isLoading) return <Skeleton className="h-96 w-full" />
  if (!tables?.length) return <EmptyState icon={UtensilsCrossed} title="No tables configured" />

  const setStatus = async (id: string, status: string) => {
    try {
      await updateTable.mutateAsync({ id, status })
      setSelected((s: Any) => (s ? { ...s, status } : s))
    } catch (e) {
      toast.error(apiError(e))
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="glass-card p-6 lg:col-span-2">
        <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2">
          {TABLE_STATUSES.map((s) => (
            <span key={s} className="flex items-center gap-1.5 text-xs text-white/55">
              <span className={cn('h-2.5 w-2.5 rounded-sm', tableColor[s].split(' ')[1])} /> {s}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-6 gap-3">
          {tables.map((t: Any) => (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className={cn(
                'flex aspect-square flex-col items-center justify-center rounded-xl border transition-all hover:scale-105',
                tableColor[t.status],
                selected?.id === t.id && 'ring-2 ring-white/50'
              )}
            >
              <span className="font-display text-lg">{t.number}</span>
              <span className="flex items-center gap-0.5 text-[10px] opacity-70">
                <Users className="h-2.5 w-2.5" /> {t.capacity}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <div className="glass-card p-6">
        {selected ? (
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl text-white">Table {selected.number}</h3>
              <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', orderColor[selected.status] ?? tableColor[selected.status])}>
                {selected.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-white/45">{selected.zone} · seats {selected.capacity}</p>
            {selected.reservedFor && (
              <p className="mt-2 text-sm text-gold-400">Reserved for {selected.reservedFor}</p>
            )}

            <p className="mt-5 mb-2 text-xs uppercase tracking-wide text-white/40">Set status</p>
            <div className="grid grid-cols-2 gap-2">
              {TABLE_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(selected.id, s)}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                    selected.status === s ? tableColor[s] : 'border-white/[0.08] text-white/55 hover:text-white'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              onClick={() => onNewOrder(selected)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gold-gradient py-2.5 text-sm font-semibold text-navy-900"
            >
              <Plus className="h-4 w-4" /> New Order
            </button>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <UtensilsCrossed className="h-8 w-8 text-white/20" />
            <p className="mt-3 text-sm text-white/40">Select a table to manage it</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------- Orders ----------------
function Orders() {
  const { data: orders, isLoading } = useOrders()
  const advance = useUpdateOrderStatus()

  if (isLoading)
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    )
  if (!orders?.length) return <EmptyState icon={ChefHat} title="No orders yet" description="Create one from the floor plan." />

  const act = async (id: string, status: string) => {
    try {
      await advance.mutateAsync({ id, status })
      toast.success(`Order → ${status.toLowerCase()}`)
    } catch (e) {
      toast.error(apiError(e))
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {orders.map((o: Any) => {
        const next = orderFlow[o.status]
        return (
          <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg text-white">Table {o.table?.number}</h3>
                <p className="font-mono text-[10px] text-white/35">#{o.orderNumber}</p>
              </div>
              <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', orderColor[o.status])}>{o.status}</span>
            </div>
            <div className="mt-3 space-y-1 border-t border-white/[0.05] pt-3">
              {o.items.map((it: Any) => (
                <div key={it.id} className="flex justify-between text-sm">
                  <span className="text-white/70">{it.quantity}× {it.menuItem?.name}</span>
                  <span className="font-mono text-white/50">{formatCurrency(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-3">
              <span className="font-mono text-lg font-bold text-gold-400">{formatCurrency(o.total)}</span>
              <div className="flex gap-2">
                {o.status !== 'PAID' && o.status !== 'CANCELLED' && (
                  <button onClick={() => act(o.id, 'CANCELLED')} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/55 hover:border-danger/40 hover:text-danger">
                    Cancel
                  </button>
                )}
                {next && (
                  <button onClick={() => act(o.id, next)} className="flex items-center gap-1 rounded-lg bg-gold-gradient px-3 py-1.5 text-xs font-semibold text-navy-900">
                    <Check className="h-3.5 w-3.5" /> {next}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ---------------- Menu ----------------
function Menu() {
  const { data: menu, isLoading } = useMenu()
  const update = useUpdateMenuItem()

  if (isLoading)
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
    )
  if (!menu?.length) return <EmptyState icon={UtensilsCrossed} title="No menu items" />

  const toggle = async (item: Any) => {
    try {
      await update.mutateAsync({ id: item.id, available: !item.available })
    } catch (e) {
      toast.error(apiError(e))
    }
  }

  const categories = [...new Set(menu.map((m: Any) => m.category))] as string[]

  return (
    <div className="space-y-6">
      {categories.map((cat) => (
        <div key={cat}>
          <h3 className="mb-3 font-display text-lg text-white">{cat}</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {menu.filter((m: Any) => m.category === cat).map((m: Any) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-white">{m.name}</p>
                    <p className="font-mono text-sm text-gold-400">{formatCurrency(m.price)}</p>
                  </div>
                  <button
                    onClick={() => toggle(m)}
                    className={cn(
                      'relative h-6 w-11 rounded-full transition-colors',
                      m.available ? 'bg-success/70' : 'bg-white/10'
                    )}
                  >
                    <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all', m.available ? 'left-[22px]' : 'left-0.5')} />
                  </button>
                </div>
                <p className="mt-2 text-xs text-white/45">{m.calories ?? '—'} cal · {m.prepTime} min prep</p>
                <p className={cn('mt-1 text-[11px] font-medium', m.available ? 'text-success' : 'text-white/35')}>
                  {m.available ? 'Available' : 'Unavailable'}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------- New Order Modal ----------------
function NewOrderModal({ table, onClose }: { table: Any; onClose: () => void }) {
  const { data: menu } = useMenu()
  const createOrder = useCreateOrder()
  const [cart, setCart] = useState<Record<string, number>>({})

  const items = (menu ?? []).filter((m: Any) => m.available)
  const total = useMemo(
    () =>
      Object.entries(cart).reduce((s, [id, qty]) => {
        const m = items.find((x: Any) => x.id === id)
        return s + (m ? m.price * qty : 0)
      }, 0),
    [cart, items]
  )

  const setQty = (id: string, delta: number) =>
    setCart((c) => {
      const q = (c[id] ?? 0) + delta
      const next = { ...c }
      if (q <= 0) delete next[id]
      else next[id] = q
      return next
    })

  const submit = async () => {
    const payloadItems = Object.entries(cart).map(([menuItemId, quantity]) => ({ menuItemId, quantity }))
    if (!payloadItems.length) return
    try {
      await createOrder.mutateAsync({ tableId: table.id, items: payloadItems })
      toast.success(`Order placed for Table ${table.number}`)
      onClose()
    } catch (e) {
      toast.error(apiError(e))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.96, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-navy-700/95 backdrop-blur-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
          <h3 className="font-display text-lg text-white">New Order · Table {table.number}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto p-4">
          {items.map((m: Any) => (
            <div key={m.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-white/[0.03]">
              <div>
                <p className="text-sm text-white">{m.name}</p>
                <p className="font-mono text-xs text-gold-400">{formatCurrency(m.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                {cart[m.id] ? (
                  <>
                    <button onClick={() => setQty(m.id, -1)} className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 text-white/60"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-5 text-center font-mono text-sm text-white">{cart[m.id]}</span>
                  </>
                ) : null}
                <button onClick={() => setQty(m.id, 1)} className="grid h-7 w-7 place-items-center rounded-lg bg-gold-gradient text-navy-900"><Plus className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.06] p-5">
          <span className="font-mono text-lg font-bold text-gold-400">{formatCurrency(total)}</span>
          <button
            onClick={submit}
            disabled={createOrder.isPending || !Object.keys(cart).length}
            className="rounded-xl bg-gold-gradient px-5 py-2.5 text-sm font-semibold text-navy-900 disabled:opacity-50"
          >
            {createOrder.isPending ? 'Placing…' : 'Place Order'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
