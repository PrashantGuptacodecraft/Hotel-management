import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, ConciergeBell, Loader2, AlertCircle } from 'lucide-react'
import { useConciergeStatus, useConciergeChat, type ChatMessage } from '@/hooks/useApi'
import { useAuth } from '@/store/auth'
import { apiError } from '@/lib/api'
import { cn } from '@utils/cn'

const SUGGESTIONS = [
  'Recommend a room for a honeymoon',
  'What dining options do you offer?',
  'Arrange an airport transfer',
  'Things to do near the hotel',
]

const GREETING: ChatMessage = {
  role: 'assistant',
  content: "Welcome to Luxe Grand. I'm your AI concierge — how may I make your stay exceptional today?",
}

export default function Concierge() {
  const { data: statusData } = useConciergeStatus()
  const chat = useConciergeChat()
  const user = useAuth((s) => s.user)
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING])
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const enabled = statusData?.enabled ?? false

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, chat.isPending])

  const send = async (text: string) => {
    const content = text.trim()
    if (!content || chat.isPending) return
    setError(null)
    const next = [...messages, { role: 'user' as const, content }]
    setMessages(next)
    setInput('')
    try {
      // Send only the real conversation (skip the canned greeting).
      const { reply } = await chat.mutateAsync(next.filter((m) => m !== GREETING))
      setMessages((m) => [...m, { role: 'assistant', content: reply }])
    } catch (err) {
      setError(apiError(err))
      setMessages((m) => [...m, { role: 'assistant', content: '⚠️ ' + apiError(err) }])
    }
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">AI Concierge</h1>
          <p className="mt-1 text-sm text-white/45">Powered by Google Gemini</p>
        </div>
        <span
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
            enabled ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
          )}
        >
          <span className={cn('h-2 w-2 rounded-full', enabled ? 'bg-success' : 'bg-warning')} />
          {enabled ? 'Online' : 'Not configured'}
        </span>
      </div>

      <div className="glass-card flex flex-1 flex-col overflow-hidden">
        {/* Not-configured banner */}
        {!enabled && (
          <div className="flex items-start gap-3 border-b border-white/[0.06] bg-warning/[0.06] p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div className="text-sm text-white/70">
              Add <code className="rounded bg-white/10 px-1.5 py-0.5 text-gold-400">GEMINI_API_KEY</code> to{' '}
              <code className="rounded bg-white/10 px-1.5 py-0.5">backend/.env</code> and restart the server to enable
              live AI responses. Get a free key at{' '}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-gold-400 underline">
                Google AI Studio
              </a>
              .
            </div>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex gap-3', m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
              >
                <div
                  className={cn(
                    'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
                    m.role === 'user' ? 'bg-electric-500/15' : 'bg-gold-500/15'
                  )}
                >
                  {m.role === 'user' ? (
                    <img
                      src={user?.avatar ?? `https://i.pravatar.cc/100?u=${user?.id}`}
                      alt=""
                      className="h-9 w-9 rounded-xl object-cover"
                    />
                  ) : (
                    <ConciergeBell className="h-4 w-4 text-gold-400" />
                  )}
                </div>
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                    m.role === 'user'
                      ? 'bg-electric-500/15 text-white'
                      : 'border border-white/[0.06] bg-white/[0.03] text-white/85'
                  )}
                >
                  {m.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {chat.isPending && (
            <div className="flex gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold-500/15">
                <ConciergeBell className="h-4 w-4 text-gold-400" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-gold-400" />
                <span className="text-sm text-white/50">Thinking…</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && enabled && (
          <div className="flex flex-wrap gap-2 px-6 pb-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white/60 transition-colors hover:border-gold-500/30 hover:text-gold-400"
              >
                <Sparkles className="h-3 w-3" /> {s}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
          className="flex items-center gap-3 border-t border-white/[0.06] p-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={enabled ? 'Ask the concierge anything…' : 'Configure GEMINI_API_KEY to chat'}
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold-500/40 focus:outline-none"
          />
          <button
            type="submit"
            disabled={chat.isPending || !input.trim()}
            className="grid h-11 w-11 place-items-center rounded-xl bg-gold-gradient text-navy-900 transition-shadow hover:shadow-gold disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
      {error && <p className="mt-2 text-center text-xs text-danger">{error}</p>}
    </div>
  )
}
